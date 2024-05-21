import path from "node:path";
import express from "express";
import {
    createProduct,
    deleteProduct,
    getSingleProduct,
    listProducts,
    relatedProducts,
    searchProducts,
    updateProduct,
} from "./productController";
import multer from "multer";
import authenticate from "../middlewares/authenticate";

const productRouter = express.Router();

// file store local ->
const upload = multer({
    dest: path.resolve(__dirname, "../../public/data/uploads"),
    // todo: put limit 10mb max.
    limits: { fileSize: 3e7 }, // 30mb 30 * 1024 * 1024
});
// routes
// /api/books
productRouter.post(
    "/",
    authenticate,
    upload.fields([
        { name: "productImage", maxCount: 1 },
        { name: "file", maxCount: 1 },
    ]),
    createProduct
);

productRouter.get("/search", searchProducts);

productRouter.patch(
    "/:productId",
    authenticate,
    upload.fields([
        { name: "productImage", maxCount: 1 },
        { name: "file", maxCount: 1 },
    ]),
    updateProduct
);

productRouter.get("/", listProducts);
productRouter.get("/:productId", getSingleProduct);
productRouter.get("/related/:productId", relatedProducts);
productRouter.delete("/:productId", authenticate, deleteProduct);

export default productRouter;
