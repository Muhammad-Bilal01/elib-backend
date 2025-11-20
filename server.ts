import app from "./src/app.ts";
import { config } from "./src/config/config.ts";
import connectDb from "./src/config/db.ts";

const startServer = async () => {
  // Connected to Database
  await connectDb();

  const port = config.port;

  app.listen(port, () => {
    console.log(`listening on port: ${port}`);
  });
};

startServer();
