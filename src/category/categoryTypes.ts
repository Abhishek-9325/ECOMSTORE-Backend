import { Product } from "../product/productTypes";

export interface Category {
    _id: string;
    title: string;
    categoryImage: string;
    // products: [Product];
    createdAt: Date;
    updatedAt: Date;
}
