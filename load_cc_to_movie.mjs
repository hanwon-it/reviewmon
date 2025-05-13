import axios from "axios";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { movie } from "./data/movie.mjs"; // Mongoose 모델

dotenv.config();
const API_KEY = process.env.TMDB_API_KEY;

async function update_credits_for_movie(movie_id) {
  try {
    const url = `https://api.themoviedb.org/3/movie/${movie_id}/credits?api_key=${API_KEY}`;
    const { data } = await axios.get(url);

    const top_cast = (data.cast || [])
      .filter((c) => c.order <= 5)
      .map((c) => ({
        name: c.name,
        character: c.character,
        profile_path: c.profile_path || null,
      }));

    const directors = (data.crew || [])
      .filter((c) => c.known_for_department === "Directing")
      .map((c) => ({
        name: c.name,
        profile_path: c.profile_path || null,
      }));

    await movie.updateOne(
      { movie_id },
      {
        $set: {
          cast: top_cast,
          director: directors,
        },
      }
    );

    console.log(`🎬 movieId ${movie_id} 업데이트 완료`);
  } catch (err) {
    console.warn(`⚠️ movieId ${movie_id} 업데이트 실패:`, err.message);
  }
}

async function run_batch() {
  await mongoose.connect(process.env.MONGODB_URL);
  const movies = await movie.find({}, { movie_id: 1 });

  for (const { movie_id } of movies) {
    await update_credits_for_movie(movie_id);
    await new Promise((res) => setTimeout(res, 300)); // API 속도 제한 대비
  }

  await mongoose.disconnect();
  console.log("✅ 모든 영화 업데이트 완료");
}

run_batch().catch(console.error);
