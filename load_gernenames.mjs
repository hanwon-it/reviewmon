import axios from "axios";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { config } from "./config.mjs";
import { Genre } from "./data/movie.mjs"; // 또는 "../models/genre.js"

dotenv.config();

const API_KEY = process.env.TMDB_API_KEY;

async function import_genres() {
  await mongoose.connect(config.db.url);
  console.log("✅ MongoDB 연결 완료");

  const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=ko-KR`;
  const { data } = await axios.get(url);

  const genres = data.genres.map((g) => ({
    genreId: g.id,
    name: g.name,
  }));

  await Genre.deleteMany(); // 기존 데이터 초기화
  await Genre.insertMany(genres);

  console.log("🎉 장르 저장 완료");
  await mongoose.disconnect();
}

import_genres().catch(console.error);
