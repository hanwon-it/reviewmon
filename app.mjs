import express from "express";
import path from "path";
import { connectDB } from "./db/database.mjs";
import userRouter from "./router/user.mjs";
import movieRouter from "./router/movie.mjs";

const app = express();

app.use(express.json());

app.use("/css", express.static(path.join(process.cwd(), "css")));
app.use("/js", express.static(path.join(process.cwd(), "js")));
app.use(express.static(path.join(process.cwd(), "html")));

app.use("/auth", userRouter);
app.use("/movies", movieRouter);

connectDB()
  .then(() => {
    app.listen(8080);
  })
  .catch(console.error);
// app.listen(config.host.port);
