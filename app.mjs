import express from "express";
import { connectDB } from "./db/database.mjs";
import userRouter from "./router/user.mjs";
<<<<<<< HEAD
import movieRouter from "./router/movie.mjs";
=======
>>>>>>> 3252ad4cee4c47a2cd5708d98dc4400f27784a92

const app = express();

app.use(express.json());

<<<<<<< HEAD
app.use("/auth", userRouter);
app.use("/movies", movieRouter);
=======
app.use("/user", userRouter);
>>>>>>> 3252ad4cee4c47a2cd5708d98dc4400f27784a92

connectDB()
  .then(() => {
    app.listen(8080);
  })
  .catch(console.error);
// app.listen(config.host.port);
