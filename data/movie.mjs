import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    movieId: { type: Number, unique: true }, // TMDb 고유 ID
    title: String,
    overview: String,
    releaseDate: String,
    posterPath: String,
    originalTitle: String,
    genreIds: [Number],
    popularity: Number,
    originalLanguage: String,
  },
  { versionKey: false }
);

export const Movie = mongoose.model("Movie", movieSchema);

const genreSchema = new mongoose.Schema({
  genreId: { type: Number, unique: true }, // TMDb genre_id
  name: { type: String, required: true }, // 장르명 (한글 또는 영문)
});

export const Genre_name = mongoose.model("Genre", genreSchema);
