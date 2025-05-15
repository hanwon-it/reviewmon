import mongoose from "mongoose";
import { Movie, Genre } from "./data/movie.mjs";
import { config } from "./config.mjs";
import dotenv from "dotenv";

dotenv.config();

try {
  // 1. DB 연결
  await mongoose.connect(config.db.url);
  console.log("✅ MongoDB 연결 완료");

  // 2. Genre 컬렉션에서 ID → 이름 매핑
  const genre_docs = await Genre.find({});
  console.log("🔢 전체 장르 개수:", genre_docs.length);

  const genre_map = {};

  genre_docs.forEach((g) => {
    console.log("genreId:", g.genreId, "name:", g.name);
    genre_map[g.genreId] = g.name;
  });

  console.log(`🎯 ${Object.keys(genre_map).length}개 장르 매핑 준비 완료`);

  // 3. Movie 전체 가져오기
  const movies = await Movie.find({}, { movie_id: 1, genre_ids: 1 });
  const total = movies.length;

  console.log(`🎬 총 ${total}개의 영화 처리 시작`);

  // 4. 각 영화에 대해 genre_names 필드 업데이트
  for (let i = 0; i < total; i++) {
    const movie = movies[i];

    const genre_names = (movie.genre_ids || [])
      .map((id) => genre_map[id])
      .filter(Boolean); // undefined/null 제거

    await Movie.updateOne(
      { movie_id: movie.movie_id },
      { $set: { genre_names: genre_names } }
    );

    // 진행 상황 출력
    const percent = (((i + 1) / total) * 100).toFixed(2);
    console.log(
      `🔄 [${i + 1}/${total}] (${percent}%) movie_id: ${movie.movie_id} 완료`
    );
  }

  console.log("🎉 모든 영화 genre_names 업데이트 완료");
} catch (err) {
  console.error("❌ 오류 발생:", err);
} finally {
  await mongoose.disconnect();
  console.log("🛑 MongoDB 연결 종료");
}
