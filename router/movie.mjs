import * as movies_controller from "../controller/movies.mjs";
import router from "./user.mjs";

// 영화 관련 정보 검색
router.get("/search", movies_controller.search_movie);

// 해당 영화 상세 정보
router.get("/:movie_id", movies_controller.movie_info);

// 인기 영화 목록
router.get("/popular", movies_controller.get_popular_movies);

// 추천 영화 정보
// GET
// http://{baseUrl}/movies/recommand
// router.get("/recommand", movies_controller.movie_recommend);

// 홈에 포스터띄워주기

export default router;
