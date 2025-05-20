import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./db/database.mjs";
import { getRecommendations } from "./controller/movies.mjs";
import userRouter from "./router/user.mjs";
import reviewRouter from "./router/review.mjs";
import movieRouter from "./router/movie.mjs";

const app = express();
app.use(express.json());

// 현재 디렉토리 경로 처리 (ESM 환경에서 __dirname 대체)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 정적 파일 제공 (public 폴더 안에 HTML, CSS, JS 넣어야 함)
// 정적 파일 제공 (html, css, js)
app.use(express.static(path.join(__dirname, "html")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/image", express.static(path.join(__dirname, "css/image")));

// 기본 라우팅 - index.html 반환
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "index.html"));
});

app.use("/movie", movieRouter);
app.use("/auth", userRouter);
app.use("/reviews", reviewRouter);

// 서버 연결 확인 및 에러확인
connectDB()
  .then(() => {
    app.listen(8080, () => {
      console.log("서버 작동중 http://localhost:8080");
    });
  })
  .catch((err) => {
    console.error("DB 연결 실패:", err);
  });
// app.listen(config.host.port);

export async function get_popular_movies(req, res) {
  try {
    const movies = await Movie.find({}).sort({ popularity: -1 }).limit(10);
    console.log("인기영화 쿼리 결과:", movies);
    res.json(movies);
  } catch (error) {
    console.error("인기 영화 조회 실패:", error);
    res.status(500).json({ message: "서버 오류", error: error.toString() });
  }
}

