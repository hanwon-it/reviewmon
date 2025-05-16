import mongoose from "mongoose";

const favorite_schema = new mongoose.Schema(
  {
    userid: { type: String, require: true },
    gerne: { type: String, require: true },
    actor: { type: String, require: true },
    director: { type: String, require: true },
  },
  { versionKey: false }
);

<<<<<<< HEAD
const Favorite = mongoose.model("favorite", favorite_schema);
=======
export const Favorite = mongoose.model("favorite", favorite_schema);
>>>>>>> 09b0c7dbc33e29424a74776f16ea3c8e3d106fef
