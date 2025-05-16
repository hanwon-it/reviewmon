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
  genre_ids: { type: Number, unique: true }, // TMDb genre_id
  name: { type: String, required: true }, // 장르명 (한글 또는 영문)
});

export const Genre = mongoose.model("Genre", genre_schema);

// movie_id로 Movie를 뽑아 주는 함수
export async function get_movie_by_id(movie_id) {
  try {
    return Movie.findOne({ movie_id });
  } catch (error) {
    console.error("get_movie_by_id error:", error);
    return null;
  }
}

// movie_id로 movie_title를 뽑아 주는 함수
export async function get_title_by_id(movie_id) {
  try {
    // return Movie.findOne({ movie_id }).select("movie_title");
    const doc = await Movie.findOne({ movie_id }).select("title");
    return doc?.title;
  } catch (error) {
    console.error("get_title_by_id error:", error);
    return null;
  }
}
