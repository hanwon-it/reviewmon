import * as movies_controller from "../controller/movies.mjs";
import router from "./user.mjs";

// 영화 관련 정보 검색
// GET
// http://{baseUrl}/movies/search
router.get("/search", movies_controller.search_movie);

// 해당 영화 상세 정보
// GET
// http://{baseUrl}/movies/info/:movieid
router.get("/info/:movieId", movies_controller.movie_info);

// 추천 영화 정보
// GET
// http://{baseUrl}/movies/recommand
// router.get("/recommand", movies_controller.movie_recommend);

// 홈에 포스트 띄우기
// GET
// http://{baseUrl}/movies/poster
// router.get("")


export default router;
