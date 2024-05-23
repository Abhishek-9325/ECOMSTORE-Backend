import { Product } from "../product/productTypes";

export interface Orders {
    _id: string;
    products: Product[];
    createdAt: string;
    updatedAt: string;
}
