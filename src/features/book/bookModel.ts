import mongoose from "mongoose";
import type { Book } from "./bookType.ts";

const bookSchema = new mongoose.Schema<Book>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    author: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    genre: {
      type: String,
      required: true,
    },
    coverPage: {
      type: String,
      required: true,
    },
    file: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const bookModel = mongoose.model<Book>("Book", bookSchema);
export default bookModel;
