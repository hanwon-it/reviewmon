import axios from "axios";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Movie } from "./data/movie.mjs"; // Mongoose 모델
import { config } from "./config.mjs";

dotenv.config();

const api_key = process.env.TMDB_API_KEY;

async function update_credits_for_movie(movie_id) {
  try {
    const url = `https://api.themoviedb.org/3/movie/${movie_id}/credits?api_key=${api_key}`;
    const { data } = await axios.get(url);

    // 🎭 출연진: order 0~6까지만 슬라이싱 (조건 없이 상위 7명)
    const top_cast = (data.cast || [])
      .filter((c) => typeof c.order === "number")
      .sort((a, b) => a.order - b.order)
      .slice(0, 7)
      .map((c) => ({
        name: c.name,
        character: c.character,
        profile_path: c.profile_path || null,
      }));

    console.log(top_cast);

    const directors = (data.crew || [])
      .filter((c) => c.job === "Director")
      .map((c) => ({
        name: c.name,
        profile_path: c.profile_path || null,
      }));

    console.log(directors);

    // 🎯 MongoDB에 업데이트
    const result = await Movie.updateOne(
      { movie_id },
      { $set: { cast: top_cast, director: directors } }
    );
    console.log("🛠 업데이트 결과:", result);

    console.log(`✅ movie_id ${movie_id} 업데이트 완료`, result);
  } catch (err) {
    console.warn(`⚠️ movie_id ${movie_id} 업데이트 실패:`, err.message);
  }
}

async function run_batch() {
  await mongoose.connect(config.db.url); // MONGODB_URL 정확히 설정되어 있어야 함

  const movies = await Movie.find({}, { movie_id: 1 });

  for (const movie of movies) {
    await update_credits_for_movie(movie.movie_id); // ✅ 안전하고 명확
  }
  await new Promise((res) => setTimeout(res, 40)); // TMDb API 요청 제한 고려

  await mongoose.disconnect();
  console.log("🎉 전체 영화 크레딧 업데이트 완료");
}

run_batch().catch(console.error);
