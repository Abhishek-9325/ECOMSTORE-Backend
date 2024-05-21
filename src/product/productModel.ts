import mongoose from "mongoose";
import { Product } from "./productTypes";

const productSchema = new mongoose.Schema<Product>(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            require: true,
        },
        categories: {
            type: mongoose.Schema.Types.ObjectId,
            // add ref
            ref: "Category",
            required: true,
        },
        productImage: {
            type: String,
            required: true,
        },
        price: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model<Product>("Product", productSchema);
