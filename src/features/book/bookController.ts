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

export const createBook = async (
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

    res.status(201).json({
      message: "Book is created",
      bookId: createBook._id,
    });
  } catch (error) {
    console.error(error);
    return next(createHttpError(500, "Error while creating books"));
  }
};

export const updateBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { title, genre, description } = req.body;

  try {
    const _req = req as AuthRequest;
    const userId = _req.userId;

    const user = await userModel.findById(userId);
    if (!user) {
      return next(createHttpError(404, "User Not Found"));
    }

    const book = await bookModel.findById(id);
    if (!book) {
      return next(createHttpError(404, "Book not found"));
    }

    if (book.author.toString() !== userId) {
      return next(createHttpError(403, "You can not update others book"));
    }
    // check if image field is exists.

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const __dirname = dirname(fileURLToPath(import.meta.url));
    let completeCoverImage = "";

    if (files.coverImage) {
      // Todo: Delete OLD image
      // book-covers/dkzujeho0txi0yrfqjsm
      // https://res.cloudinary.com/degzfrkse/image/upload/v1712590372/book-covers/u4bt9x7sv0r0cg5cuynm.png

      const coverFileSplits = book.coverPage.split("/");
      const coverImagePublicId =
        coverFileSplits.at(-2) +
        "/" +
        coverFileSplits.at(-1)?.split(".").at(-2); // book-covers/u4bt9x7sv0r0cg5cuynm
      await cloudinary.uploader.destroy(coverImagePublicId);

      const filename = files?.coverImage[0]?.filename ?? "";
      const converMimeType =
        files?.coverImage[0]?.mimetype.split("/").at(-1) ?? "png";
      // send files to cloudinary
      const filePath = path.resolve(
        __dirname,
        "../../../public/data/uploads/" + filename
      );
      completeCoverImage = filename;
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        filename_override: completeCoverImage,
        folder: "book-covers",
        format: converMimeType as string,
      });

      completeCoverImage = uploadResult.secure_url;
      await fs.promises.unlink(filePath);
    }

    // check if file field is exists.
    let completeFileName = "";
    if (files.file) {
      //todo:  Delete Old Image
      const bookFileSplits = book.coverPage.split("/");
      const bookFilePublicId =
        bookFileSplits.at(-2) + "/" + bookFileSplits.at(-1)?.split(".").at(-2); // book-covers/u4bt9x7sv0r0cg5cuynm

      await cloudinary.uploader.destroy(bookFilePublicId, {
        resource_type: "raw",
      });

      const bookFilePath = path.resolve(
        __dirname,
        "../../../public/data/uploads/" + files.file[0]?.filename
      );

      const bookFileName = files.file[0]?.filename ?? "";
      completeFileName = bookFileName;

      const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
        resource_type: "raw",
        filename_override: completeFileName,
        folder: "book-pdfs",
        format: "pdf",
      });

      completeFileName = uploadResultPdf.secure_url;
      await fs.promises.unlink(bookFilePath);
    }

    const updatedBook = await bookModel.findOneAndUpdate(
      {
        _id: id,
      },
      {
        title: title,
        description: description,
        genre: genre,
        coverImage: completeCoverImage ? completeCoverImage : book.coverPage,
        file: completeFileName ? completeFileName : book.file,
      },
      { new: true }
    );

    res.status(200).json(updatedBook);
  } catch (error) {
    console.error(error);
    return next(createHttpError(500, "Error while updating books"));
  }
};

export const listBooks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // const sleep = await new Promise((resolve) => setTimeout(resolve, 5000));

  try {
    // todo: add pagination.
    const book = await bookModel.find().populate("author", "name");
    res.json(book);
  } catch (err) {
    console.error(err);
    return next(createHttpError(500, "Error while getting a book"));
  }
};

export const getSingleBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bookId = req.params.bookId;

  try {
    const book = await bookModel
      .findOne({ _id: bookId })
      // populate author field
      .populate("author", "name");
    if (!book) {
      return next(createHttpError(404, "Book not found."));
    }

    return res.json(book);
  } catch (err) {
    console.error(err);
    return next(createHttpError(500, "Error while getting a book"));
  }
};

export const deleteBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bookId = req.params.bookId;

  const book = await bookModel.findOne({ _id: bookId });
  if (!book) {
    return next(createHttpError(404, "Book not found"));
  }

  // Check Access
  const _req = req as AuthRequest;
  if (book.author.toString() !== _req.userId) {
    return next(createHttpError(403, "You can not update others book."));
  }
  // book-covers/dkzujeho0txi0yrfqjsm
  // https://res.cloudinary.com/degzfrkse/image/upload/v1712590372/book-covers/u4bt9x7sv0r0cg5cuynm.png

  const coverFileSplits = book.coverPage.split("/");
  const coverImagePublicId =
    coverFileSplits.at(-2) + "/" + coverFileSplits.at(-1)?.split(".").at(-2);

  const bookFileSplits = book.file.split("/");
  const bookFilePublicId = bookFileSplits.at(-2) + "/" + bookFileSplits.at(-1);
  console.log("bookFilePublicId", bookFilePublicId);
  // todo: add try error block
  await cloudinary.uploader.destroy(coverImagePublicId);
  await cloudinary.uploader.destroy(bookFilePublicId, {
    resource_type: "raw",
  });

  await bookModel.deleteOne({ _id: bookId });

  return res.sendStatus(204);
};
