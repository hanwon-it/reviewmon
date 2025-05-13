import axios from "axios";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { config } from "./config.mjs";
import { Genre_name } from "./data/movie.mjs"; // 또는 "../models/genre.js"
dotenv.config();

const API_KEY = process.env.TMDB_API_KEY;

async function importGenres() {
  await mongoose.connect(config.db.url);
  console.log("✅ MongoDB 연결 완료");

  const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=ko-KR`;
  const { data } = await axios.get(url);

  const genres = data.genres.map((g) => ({
    genreId: g.id,
    name: g.name,
  }));

  await Genre_name.deleteMany(); // 기존 데이터 초기화
  await Genre_name.insertMany(genres);

  console.log("🎉 장르 저장 완료");
  await mongoose.disconnect();
}

importGenres().catch(console.error);

const moviesWithGenres = await Movie.aggregate([
  {
    $lookup: {
      from: "genres", // 조인 대상 컬렉션 이름 (소문자 복수형일 가능성 높음)
      localField: "genreIds", // 영화 도큐먼트의 필드
      foreignField: "genreId", // 장르 컬렉션의 필드
      as: "genresMatched", // 결과로 붙일 필드
    },
  },
  {
    $project: {
      title: 1,
      genreIds: 1,
      genreNames: "$genresMatched.name", // name 배열 추출
    },
  },
]);
