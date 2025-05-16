import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./db/database.mjs";
import userRouter from "./router/user.mjs";
import movieRouter from "./router/movie.mjs";

const app = express();
app.use(express.json());

// 🔧 현재 디렉토리 경로 처리 (ESM 환경에서 __dirname 대체)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ 정적 파일 제공 (public 폴더 안에 HTML, CSS, JS 넣어야 함)
// ✅ 정적 파일 제공 (html, css, js)
app.use(express.static(path.join(__dirname, "html")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));


// ✅ 기본 라우팅 - index.html 반환
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "index.html"));
});

// ✅ API 라우팅
app.use("/auth", userRouter);
app.use("/movies", movieRouter);

// ✅ DB 연결 및 서버 실행
connectDB()
  .then(() => {
    app.listen(8080, () => {
      console.log("✅ Server running at http://localhost:8080");
    });
  })
  .catch((err) => {
    console.error("❌ DB 연결 실패:", err);
  });
