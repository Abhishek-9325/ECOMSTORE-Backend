import path from "node:path";
import express from "express";
import {
    categoryProducts,
    createCategory,
    deleteCategory,
    getSingleCategory,
    listCategory,
    updateCategory,
} from "./categoryController";
import multer from "multer";
import authenticate from "../middlewares/authenticate";

const categoryRouter = express.Router();

// file store local ->
const upload = multer({
    dest: path.resolve(__dirname, "../../public/data/uploads"),
    // todo: put limit 10mb max.
    limits: { fileSize: 3e7 }, // 30mb 30 * 1024 * 1024
});
// routes
// /api/books
categoryRouter.post(
    "/",
    authenticate,
    upload.fields([{ name: "categoryImage", maxCount: 1 }]),
    createCategory
);

categoryRouter.patch(
    "/:categoryId",
    authenticate,
    upload.fields([
        { name: "categoryImage", maxCount: 1 },
        { name: "file", maxCount: 1 },
    ]),
    updateCategory
);

categoryRouter.get("/", listCategory);
categoryRouter.get("/:categoryId", getSingleCategory);
categoryRouter.get("/products/:categoryId", categoryProducts);
categoryRouter.delete("/:categoryId", authenticate, deleteCategory);

export default categoryRouter;
