import express from "express";
import { connectDB } from "./db/database.mjs";
import userRouter from "./router/user.mjs";
import movieRouter from "./router/movie.mjs";

const app = express();

app.use(express.json());

app.use("/auth", userRouter);
app.use("/movies", movieRouter);

connectDB()
  .then(() => {
    app.listen(8080);
  })
  .catch(console.error);
// app.listen(config.host.port);
