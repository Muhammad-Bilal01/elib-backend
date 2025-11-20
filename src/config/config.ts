import "dotenv/config";

// add _ to make private variable, its a convential
const _config = {
  port: process.env.PORT || 4000,
  databaseUrl: process.env.MONGODB_CONNECTION_STRING,
};

export const config = Object.freeze(_config);
