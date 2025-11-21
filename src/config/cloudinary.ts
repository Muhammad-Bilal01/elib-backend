import { v2 as cloudinary } from "cloudinary";
import { config } from "./config.ts";

// Configuration
cloudinary.config({
  cloud_name: config.clodinaryCloudName as string,
  api_key: config.clodinaryApiKey as string,
  api_secret: config.clodinaryApiSecret as string,
});

export default cloudinary;
