import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";
import categoryRouter from "./category/categoryRouter";
import productRouter from "./product/productRouter";
import orderRouter from "./orders/orderRouter";
import stripeRouter from "./stripe/stripe";

const app = express();
app.use("/api/stripe", stripeRouter);
app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:3000"],
    })
);

app.use(express.json());

// Routes
// Http methods: GET, POST, PUT, PATCH, DELETE
app.get("/", (req, res, next) => {
    res.json({ message: "Your server is up and running, utilize your api" });
});

app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/orders", orderRouter);
// app.use("/api/stripe", stripeRouter);

// Global error handler
app.use(globalErrorHandler);

export default app;
