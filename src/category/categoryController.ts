import path from "node:path";
import fs from "node:fs";
import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";
import createHttpError from "http-errors";
import categoryModel from "./categoryModel";
import productModel from "../product/productModel";

const createCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { title } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    // 'application/pdf'
    const coverImageMimeType = files.categoryImage[0].mimetype
        .split("/")
        .at(-1);
    const fileName = files.categoryImage[0].filename;
    const filePath = path.resolve(
        __dirname,
        "../../public/data/uploads",
        fileName
    );

    try {
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            filename_override: fileName,
            folder: "ecommerce-app",
            format: coverImageMimeType,
        });

        const newCategory = await categoryModel.create({
            title,
            categoryImage: uploadResult.secure_url,
        });

        // Delete temp.files
        // todo: wrap in try catch...
        await fs.promises.unlink(filePath);

        res.status(201).json({ id: newCategory._id });
    } catch (err) {
        console.log(err);
        return next(createHttpError(500, "Error while uploading the files."));
    }
};

const updateCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { title } = req.body;
    const categoryId = req.params.categoryId;

    const category = await categoryModel.findOne({ _id: categoryId });

    if (!category) {
        return next(createHttpError(404, "Category not found"));
    }

    // check if image field is exists.

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let completeCoverImage = "";
    if (files.categoryImage) {
        const filename = files.categoryImage[0].filename;
        const converMimeType = files.categoryImage[0].mimetype
            .split("/")
            .at(-1);
        // send files to cloudinary
        const filePath = path.resolve(
            __dirname,
            "../../public/data/uploads/" + filename
        );
        completeCoverImage = filename;
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            filename_override: completeCoverImage,
            folder: "ecommerce-app",
            format: converMimeType,
        });

        completeCoverImage = uploadResult.secure_url;
        await fs.promises.unlink(filePath);
    }

    const updatedCategory = await categoryModel.findOneAndUpdate(
        {
            _id: categoryId,
        },
        {
            title: title,
            categoryImage: completeCoverImage
                ? completeCoverImage
                : category.categoryImage,
        },
        { new: true }
    );

    res.json(updatedCategory);
};

const listCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // const sleep = await new Promise((resolve) => setTimeout(resolve, 5000));

    try {
        // todo: add pagination.
        const categories = await categoryModel.find();
        res.json(categories);
    } catch (err) {
        return next(createHttpError(500, "Error while getting categories."));
    }
};

const getSingleCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const categoryId = req.params.categoryId;

    try {
        const category = await categoryModel.findOne({ _id: categoryId });
        if (!category) {
            return next(createHttpError(404, "Category not found."));
        }

        return res.json(category);
    } catch (err) {
        return next(createHttpError(500, "Error while getting a category."));
    }
};

const deleteCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const categoryId = req.params.categoryId;

    const category = await categoryModel.findOne({ _id: categoryId });
    if (!category) {
        return next(createHttpError(404, "Category not found"));
    }

    const coverFileSplits = category.categoryImage.split("/");
    const coverImagePublicId =
        coverFileSplits.at(-2) +
        "/" +
        coverFileSplits.at(-1)?.split(".").at(-2);

    // todo: add try error block
    await cloudinary.uploader.destroy(coverImagePublicId);

    await categoryModel.deleteOne({ _id: categoryId });

    return res.sendStatus(204);
};

const categoryProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const categoryId = req.params.categoryId;

    try {
        const products = await productModel.find({ categories: categoryId });
        res.json(products);
    } catch (err) {
        return next(createHttpError(500, "Error while getting products"));
    }
};

export {
    createCategory,
    updateCategory,
    listCategory,
    getSingleCategory,
    deleteCategory,
    categoryProducts,
};
