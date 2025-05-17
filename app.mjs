import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./db/database.mjs";
import { getRecommendations } from "./controller/movies.mjs";
import userRouter from "./router/user.mjs";
import reviewRouter from "./router/review.mjs";
import movieRouter from "./router/movie.mjs";

const app = express();

// JSON 요청 바디 파싱
app.use(express.json());

// __dirname 대체 (ESM 환경에서 __dirname 사용)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 정적 파일 제공 설정
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/", express.static(path.join(__dirname, "html")));

// 추천 API
// GET /api/recommendations/:userId
app.get("/api/recommendations/:userId", getRecommendations);

// 인증(Auth) 관련 라우터
// /auth/*
app.use("/auth", userRouter);

// 리뷰(Review) 관련 라우터
// /api/reviews/*
app.use("/api/reviews", reviewRouter);

// 영화(Movie) 관련 라우터 (검색/상세/인기)
// GET /api/search?query=...&type=...
// GET /api/info/:movie_id
// GET /api/popular
app.use("/api", movieRouter);

// 특정 HTML 페이지 핸들링 (선택적)
// GET /reviewpage.html
app.get("/reviewpage.html", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "reviewpage.html"));
});

// MongoDB 연결 및 서버 시작
connectDB()
  .then(() => {
    app.listen(8080, () => {
      console.log("서버 작동중 http://localhost:8080");
    });
  })
  .catch((err) => {
    console.error("❌ DB 연결 실패:", err);
  });
