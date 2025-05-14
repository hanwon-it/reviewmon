import mongoose from "mongoose";
import { Movie } from "./data/movie.mjs";
import { Genre } from "./data/movie.mjs"; // 장르 스키마
import { config } from "./config.mjs";

dotenv.config();

await mongoose.connect(config.db.url);

// 1. 모든 장르 ID → 한글 이름 매핑
const genre_docs = await Genre.find({});
const genre_map = {};
genre_docs.forEach((g) => {
  genre_map[g.id] = g.name;
});

// 2. 영화 전체 업데이트
const movies = await Movie.find({}, { movie_id: 1, genre_ids: 1 });
for (const movie of movies) {
  const genre_names = (movie.genre_ids || [])
    .map((id) => genre_map[id])
    .filter((name) => name); // 매핑 실패한 값은 제외

  await Movie.updateOne(
    { movie_id: movie.movie_id },
    { $set: { genre_names: genre_names } }
  );
  console.log(`✅ movie_id ${movie.movie_id} 장르명 업데이트 완료`);
}

await mongoose.disconnect();
