import Mongoose from "mongoose";

const favorite_schema = new Mongoose.Schema(
  {
    gerne: { type: [String], require: true },
    actor: { type: [String], require: true },
    director: { type: [String], require: true },
    user_idx: { type: String },
  },
  { versionKey: false }
);

const Favorite = Mongoose.model("favorite", favorite_schema);
