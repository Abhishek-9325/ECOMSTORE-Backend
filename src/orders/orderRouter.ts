import express from "express";
import {
    createOrder,
    deleteOrder,
    getSingleOrder,
    listOrders,
} from "./orderController";
import authenticate from "../middlewares/authenticate";

const orderRouter = express.Router();

// routes
orderRouter.post("/", createOrder);

orderRouter.get("/", listOrders);
orderRouter.get("/:orderId", getSingleOrder);
orderRouter.delete("/:orderId", authenticate, deleteOrder);

export default orderRouter;
