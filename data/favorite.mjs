import mongoose from "mongoose";

const favorite_schema = new mongoose.Schema(
  {
    user_idx: { type: String, required: true },
    userid: { type: String },
    genre: { type: [String], required: true },
    actor: [
      {
        id: { type: Number },
        name: { type: String, required: true }
      }
    ],
    director: [
      {
        id: { type: Number},
        name: { type: String, required: true }
      }
    ]
  },
  { versionKey: false }
);

export const Favorite = mongoose.model("favorite", favorite_schema);
