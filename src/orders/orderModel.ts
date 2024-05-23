import mongoose from "mongoose";
import { Orders } from "./orderTypes";

const ordersSchema = new mongoose.Schema<Orders>(
    {
        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model<Orders>("Order", ordersSchema);
