import mongoose from "mongoose";

const movie_schema = new mongoose.Schema(
  {
    movie_id: { type: Number, unique: true }, // TMDb 고유 ID
    title: String,
    overview: String,
    release_date: String,
    poster_path: String,
    original_title: String,
    genre_ids: [Number],
    popularity: Number,
    original_language: String,
    cast: [
      {
        name: String,
        character: String,
        profile_path: String,
      },
    ],
    director: [
      {
        name: String,
        profile_path: String,
      },
    ],
  },
  { versionKey: false }
);

export const Movie = mongoose.model("movie", movie_schema);

const genre_schema = new mongoose.Schema({
  genre_ids: { type: Number, unique: true }, // TMDb genre_id
  name: { type: String, required: true }, // 장르명 (한글 또는 영문)
});

export const Genre = mongoose.model("Genre", genre_schema);
