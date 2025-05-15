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
    genre_names: [String],
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
  genreId: Number, // ✅ 반드시 포함
  name: String,
});

export const Genre = mongoose.model("Genre", genre_schema, "genres");
