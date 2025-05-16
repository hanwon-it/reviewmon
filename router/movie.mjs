import express from "express";
import * as movies_controller from "../controller/movies.mjs";

const router = express.Router(); // <-- 새 router 정의

// 영화 관련 정보 검색
router.get("/search", movies_controller.search_movie);

// 해당 영화 상세 정보
router.get("/info/:movie_id", movies_controller.movie_info);

// 인기 영화 목록
router.get("/popular", movies_controller.get_popular_movies);

// 추후 추천 영화 라우터도 활성화 가능
// router.get("/recommand", movies_controller.movie_recommend);

export default router;
