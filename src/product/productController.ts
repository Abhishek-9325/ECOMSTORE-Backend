import path from "node:path";
import fs from "node:fs";
import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";
import createHttpError from "http-errors";
import productModel from "./productModel";

const createProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { title, price, description, categories } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    // 'application/pdf'
    const coverImageMimeType = files?.productImage[0]?.mimetype
        ?.split("/")
        .at(-1);
    const fileName = files?.productImage[0]?.filename;
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

        const newProduct = await productModel.create({
            title,
            description,
            price,
            categories,
            productImage: uploadResult.secure_url,
        });

        // Delete temp.files
        // todo: wrap in try catch...
        await fs.promises.unlink(filePath);

        res.status(201).json({ id: newProduct._id });
    } catch (err) {
        console.log(err);
        return next(createHttpError(500, "Error while uploading the files."));
    }
};

const updateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { title, price, description, categories } = req.body;
    const productId = req.params.productId;

    const product = await productModel.findOne({ _id: productId });

    if (!product) {
        return next(createHttpError(404, "Product not found"));
    }

    // check if image field is exists.

    console.log(req.files, "req.files");

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let completeCoverImage = "";
    try {
        if (files?.productImage) {
            const filename = files?.productImage[0].filename;
            const converMimeType = files?.productImage[0].mimetype
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
            console.log("completeCoverImage", completeCoverImage);
            await fs.promises.unlink(filePath);
        }

        const updatedProduct = await productModel.findOneAndUpdate(
            {
                _id: productId,
            },
            {
                title: title,
                description: description,
                price: price,
                productImage: completeCoverImage
                    ? completeCoverImage
                    : product.productImage,
                categories: categories,
            },
            { new: true }
        );

        res.json(updatedProduct);
    } catch (error) {
        console.log(error);
        return next(createHttpError(500, "Error while uploading the files."));
    }
};

const listProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // const sleep = await new Promise((resolve) => setTimeout(resolve, 5000));

    try {
        // todo: add pagination.
        const product = await productModel.find().populate("categories");
        res.json(product);
    } catch (err) {
        return next(createHttpError(500, "Error while getting products"));
    }
};

const getSingleProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const productId = req.params.productId;

    try {
        const product = await productModel
            .findOne({ _id: productId })
            // populate author field
            .populate("categories");
        if (!product) {
            return next(createHttpError(404, "Product not found."));
        }

        return res.json(product);
    } catch (err) {
        return next(createHttpError(500, "Error while getting a product"));
    }
};

const deleteProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const productId = req.params.productId;

    const product = await productModel.findOne({ _id: productId });
    if (!product) {
        return next(createHttpError(404, "Product not found"));
    }

    const coverFileSplits = product.productImage.split("/");
    const coverImagePublicId =
        coverFileSplits.at(-2) +
        "/" +
        coverFileSplits.at(-1)?.split(".").at(-2);

    // const bookFileSplits = book.file.split("/");
    const bookFilePublicId =
        // bookFileSplits.at(-2) + "/" + bookFileSplits.at(-1);
        // console.log("bookFilePublicId", bookFilePublicId);
        // todo: add try error block
        await cloudinary.uploader.destroy(coverImagePublicId);
    await cloudinary.uploader.destroy(bookFilePublicId, {
        resource_type: "raw",
    });

    await productModel.deleteOne({ _id: productId });

    return res.sendStatus(204);
};

const searchProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { query } = req.query;
    console.log(query);
    try {
        const products = await productModel.find({
            title: {
                $regex: query,
                $options: "i",
            },
        });
        res.json(products);
    } catch (error) {
        next(createHttpError(500, "Error while querying products"));
    }
};

const relatedProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const productId = req.params.productId;
    try {
        const product = await productModel.findOne({ _id: productId });
        const relatedProducts = await productModel
            .find({
                categories: product?.categories,
                _id: { $ne: productId },
            })
            .limit(4);
        res.json(relatedProducts);
    } catch (error) {
        next(createHttpError(500, "Error while querying related products"));
    }
};

export {
    createProduct,
    updateProduct,
    listProducts,
    getSingleProduct,
    deleteProduct,
    searchProducts,
    relatedProducts,
};
