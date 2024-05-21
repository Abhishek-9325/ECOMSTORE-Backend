import { Category } from "../category/categoryTypes";

export interface Product {
    _id: string;
    title: string | Object;
    description: string;
    productImage: string;
    categories: string | Category;
    price: string;
    createdAt: Date;
    updatedAt: Date;
}
