import Mongoose from "mongoose";

const favorite_schema = new Mongoose.Schema(
  {
    userid: { type: String, require: true },
    gerne: { type: String, require: true },
    actor: { type: String, require: true },
    director: { type: String, require: true },
  },
  { versionKey: false }
);

const Favorite = Mongoose.model("favorite", favorite_schema);
