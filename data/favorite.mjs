import mongoose from "mongoose";

const favorite_schema = new mongoose.Schema(
  {
    user_idx: { type: String, required: true },
    userid: { type: String },
    gerne: { type: [String], require: true },
    actor: [
      {
        id: { type: Number, required: true },
        name: { type: String, required: true },
      },
    ],
    director: [
      {
        id: { type: Number, required: true },
        name: { type: String, required: true },
      },
    ],
  },
  { versionKey: false }
);

export const Favorite = mongoose.model("favorite", favorite_schema);
