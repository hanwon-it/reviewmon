import { query } from "express-validator";
import mongoose from "mongoose";

const movie_schema = new mongoose.Schema({
  title: String,
  poster_path: String,
  genres: [{ type: mongoose.Schema.Types.ObjectId, ref: "Genre" }],
  tmdb_id: Number,
});

const genreSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

export async function search(type, item) {
  var searchOption = [
    {
      $search: {
        index: "Cluster0", //몽고디비 클러스터명
        text: {
          query: item,
          path: type,
        },
      },
    },
  ];
  return searchOption;
}
