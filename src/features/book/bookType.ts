import type { UserType } from "../user/userTypes.ts";

export interface Book {
  _id: string;
  title: string;
  description: string;
  author: UserType;
  genre: string;
  coverPage: string;
  file: string;
  createdAt: Date;
  updatedAt: Date;
}
