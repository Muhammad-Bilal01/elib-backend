import type { NextFunction, Request, Response } from "express";
import cloudinary from "../../config/cloudinary.ts";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const creatteBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //   const {} = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  //   console.log("files", req.files);
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
  const fileName = files.coverImage[0].filename;
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
  console.log("Results", uploadResults);

  const bookMimeType = files.file[0].mimetype.split("/").at(-1);
  const bookFileName = files.file[0].filename;
  const bookFilePath = path.resolve(
    __dirname,
    "../../../public/data/uploads",
    fileName
  );

  const bookFileUploadResults = await cloudinary.uploader.upload(bookFilePath, {
    resource_type: "raw",
    filename_override: bookFileName,
    format: bookMimeType,
    folder: "books-pdf",
  });

  console.log("Book File Results", bookFileUploadResults);

  res.status(200).json({
    message: "OK",
  });
};
