import type { NextFunction, Request, Response } from "express";
import cloudinary from "../../config/cloudinary.ts";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import createHttpError from "http-errors";
import bookModel from "./bookModel.ts";
import type { Book } from "./bookType.ts";
import fs from "node:fs";
import type { AuthRequest } from "../../middlewares/authentication.ts";
import { userModel } from "../user/userModel.ts";

export const creatteBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, genre, description } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  if (!title || !genre) {
    return next(createHttpError(400, "Title and genre are required"));
  }

  if (!files || !files.coverImage || !files.file) {
    return next(createHttpError(400, "Cover Image and File are required"));
  }

  try {
    const _req = req as AuthRequest;
    const userId = _req.userId;

    const user = await userModel.findById(userId);
    if (!user) {
      return next(createHttpError(404, "User Not Found"));
    }

    const __dirname = dirname(fileURLToPath(import.meta.url));

    const coverImageMimeType =
      files.coverImage[0]?.mimetype.split("/").pop() ?? "jpg";
    const fileName = files.coverImage[0]!.filename;
    const filePath = path.resolve(
      __dirname,
      "../../../public/data/uploads",
      fileName
    );

    const uploadResults = await cloudinary.uploader.upload(filePath, {
      filename_override: fileName,
      folder: "books-cover",
      format: coverImageMimeType,
    });

    // upload books
    const bookMimeType = files.file[0]?.mimetype.split("/").pop() ?? "pdf";
    const bookFileName = files.file[0]!.filename;
    const bookFilePath = path.resolve(
      __dirname,
      "../../../public/data/uploads",
      bookFileName
    );

    const bookFileUploadResults = await cloudinary.uploader.upload(
      bookFilePath,
      {
        resource_type: "raw",
        filename_override: bookFileName,
        format: bookMimeType,
        folder: "books-pdf",
      }
    );

    // create books
    const createBook: Book = await bookModel.create({
      title,
      description: description || "",
      genre,
      author: userId,
      coverPage: uploadResults.secure_url,
      file: bookFileUploadResults.secure_url,
    });

    // Delete Temporary storage
    await fs.promises.unlink(filePath);
    await fs.promises.unlink(bookFilePath);

    res.status(200).json({
      message: "Book is created",
      bookId: createBook._id,
    });
  } catch (error) {
    console.error(error);
    return next(createHttpError(500, "Error while creating books"));
  }
};
