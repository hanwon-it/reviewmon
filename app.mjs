import express from "express";
import postsRouter from "./router/posts.mjs";
import authRouter from "./router/auth.mjs";
import { config } from "./config.mjs";
import { connectDB } from "./db/database.mjs";
import axios from "axios";
import dotenv from "dotenv";

const app = express();

// TMDB 기본 설정 저장용
let IMAGE_BASE_URL = "";
let POSTER_SIZE = "w500"; // 원하는 사이즈 선택
app.use(express.json());

app.use("/posts", postsRouter);
app.use("/auth", authRouter);

// 서버 시작 시 TMDB configuration 불러오기
const fetchTMDBConfig = async () => {
  try {
    const res = await axios.get("https://api.themoviedb.org/3/configuration", {
      params: {
        api_key: process.env.TMDB_API_KEY,
      },
    });

    IMAGE_BASE_URL = res.data.images.secure_base_url;
    console.log("[TMDB 설정 완료]", IMAGE_BASE_URL);
  } catch (error) {
    console.error("TMDB 설정 로딩 실패:", error.message);
  }
};

// 샘플 영화 데이터 (보통은 DB에서 불러옴)
const movie_list = [
  {
    id: 1,
    title: "Inception",
    poster_path: "/dDlfjR7gllmr8HTeN6rfrYhTdwX.jpg",
  },
  {
    id: 2,
    title: "Interstellar",
    poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  },
];

// 라우트: 영화 리스트 + 이미지 URL 반환
app.get("/api/movies", (req, res) => {
  const moviesWithImage = movie_list.map((movie) => ({
    ...movie,
    poster_url: `${IMAGE_BASE_URL}${POSTER_SIZE}${movie.poster_path}`,
  }));

  res.json(moviesWithImage);
});

// 서버 시작
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await fetchTMDBConfig(); // 서버 시작 시 config 받아오기
});
/*
app.use((req, res, next) => {
  res.sendStatus(404);
});

connectDB()
  .then(() => {
    app.listen(config.host.port);
  })
  .catch(console.error);
*/
