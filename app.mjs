import express from "express";
import { connectDB } from "./db/database.mjs";
import userRouter from "./router/user.mjs";

const app = express();

app.use(express.json());

app.use("/user", userRouter);

connectDB()
  .then(() => {
    app.listen(8080);
  })
  .catch(console.error);
// app.listen(config.host.port);
