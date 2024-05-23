import path from "node:path";
import fs from "node:fs";
import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";
import createHttpError from "http-errors";
import productModel from "./orderModel";
import orderModel from "./orderModel";

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.body);
    const { products } = req.body;

    try {
        const newOrder = await orderModel.create({
            products,
        });

        res.status(201).json({ id: newOrder._id });
    } catch (err) {
        console.log(err);
        return next(createHttpError(500, "Error while creating the order."));
    }
};

const listOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await orderModel.find().populate("products");
        res.json(products);
    } catch (err) {
        return next(createHttpError(500, "Error while getting Orders"));
    }
};

const getSingleOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const orderId = req.params.orderId;

    try {
        const order = await orderModel
            .findOne({ _id: orderId })
            .populate("products");
        if (!order) {
            return next(createHttpError(404, "Order not found."));
        }

        return res.json(order);
    } catch (err) {
        return next(createHttpError(500, "Error while getting a order"));
    }
};

const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.orderId;

    const order = await orderModel.findOne({ _id: orderId });
    if (!order) {
        return next(createHttpError(404, "Order not found"));
    }

    await orderModel.deleteOne({ _id: orderId });

    return res.sendStatus(204);
};

export { createOrder, listOrders, getSingleOrder, deleteOrder };
