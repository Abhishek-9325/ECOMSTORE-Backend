import mongoose from "mongoose";
import { Category } from "./categoryTypes";

const categorySchema = new mongoose.Schema<Category>(
    {
        title: {
            type: String,
            required: true,
        },
        categoryImage: {
            type: String,
            required: true,
        },
        // products: [
        //     {
        //         type: mongoose.Schema.Types.ObjectId,
        //         // add ref
        //         ref: "Product",
        //     },
        // ],
    },
    { timestamps: true }
);

export default mongoose.model<Category>("Category", categorySchema);
