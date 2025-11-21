import "dotenv/config";

// add _ to make private variable, its a convential
const _config = {
  port: process.env.PORT || 4000,
  databaseUrl: process.env.MONGODB_CONNECTION_STRING,
  env: process.env.NODE_ENV,
  jwt_secret: process.env.JWT_SECRET,
};

export const config = Object.freeze(_config);
