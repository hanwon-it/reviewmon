import express from "express";
import * as movies_controller from "../controller/movies.mjs";
import { is_auth } from "../middleware/auth.mjs";
const router = express.Router();


// 인기 영화 목록 (정적 라우트 먼저!)
router.get("/popular", movies_controller.get_popular_movies);

// 추천 영화 정보
router.get("/recommend", is_auth, movies_controller.recommend_movies_by_user);

// 배우/감독 api 호출
router.get("/search_person", movies_controller.search_person);

// 영화 관련 정보 검색
router.get("/search", movies_controller.search_movie);

// 해당 영화 상세 정보 (동적 라우트는 마지막에!)
router.get("/:movie_id", movies_controller.movie_info);

// TMDB 인물 정보 프록시
router.get("/person/:person_id", movies_controller.get_person_info);
// TMDB 인물 출연/감독작 프록시
router.get("/person/:person_id/credits", movies_controller.get_person_credits_proxy);

// TMDB 인물 검색 프록시 (프론트엔드에서 안전하게 사용)
router.get("/search_person", async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: "query 필요" });
  const TMDB_API_KEY = require("../config.mjs").config.tmdb.api_key;
  try {
    const url = `https://api.themoviedb.org/3/search/person?api_key=${TMDB_API_KEY}&language=ko-KR&query=${encodeURIComponent(query)}`;
    const tmdbRes = await fetch(url);
    const data = await tmdbRes.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "TMDB 인물 검색 실패" });
  }
});

export default router;
