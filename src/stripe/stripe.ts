import express, { Request, Response } from "express";
import { Product } from "../product/productTypes";
import { config } from "../config/config";
const bodyParser = require("body-parser");
const stripeRouter = express.Router();
const stripe = require("stripe")(config.stripeSecretKey);
const calculateOrderAmount = (item: Product) => {
    return Number(item.price) * 100;
};

stripeRouter.post(
    "/create-checkout-session",
    express.json(),
    async (req: Request, res: Response) => {
        try {
            if (!req.body.products) {
                return res.status(400).json({ message: "Products not found" });
            }
            if (!req.headers.authorization) {
                return res.status(400).json({ message: "Token not found" });
            }
            const { products } = req.body;
            // console.log(products);
            // console.log(
            //     products.map((item: Product) => {
            //         console.log("item title", item.title);
            //     })
            // );

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: products.map((item: Product) => {
                    return {
                        price_data: {
                            currency: "inr",
                            product_data: {
                                name: item.title,
                                images: [item.productImage],
                            },
                            unit_amount: calculateOrderAmount(item as Product),
                        },
                        quantity: item.quantity,
                    };
                }),
                mode: "payment",
                success_url: `${config.frontendDomain}/order/success/${products._id}`,
                cancel_url: `${config.frontendDomain}/order/cancel`,
            });

            res.json({ id: session.id });
        } catch (err) {
            console.log(err);
        }
    }
);

const endpointSecret = process.env.ENDPOINT_SECRET;

stripeRouter.post("/webhook", async (request, response) => {
    console.log("webhook called");
    console.log(request.body);
    const sig = request.headers["stripe-signature"];

    let event;

    try {
        console.log("Entered try block");
        event = stripe.webhooks.constructEvent(
            request.body,
            sig,
            endpointSecret
        );
        console.log("event", event);
    } catch (err: any) {
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    switch (event.type) {
        case "payment_intent.succeeded":
            const paymentIntentSucceeded = event.data.object;
            console.log("event object", paymentIntentSucceeded);
            // const order = await Order.findById(
            //   paymentIntentSucceeded.metadata.orderId
            // );
            // order.paymentStatus = 'received';
            // await order.save();

            break;
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
});

export default stripeRouter;
