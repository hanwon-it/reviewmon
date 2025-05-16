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

const Favorite = mongoose.model("favorite", favorite_schema);
