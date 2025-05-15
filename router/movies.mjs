import { movies_controller } from "../controller/movies.mjs";

// 영화 관련 정보 검색
// GET
// http://{baseUrl}/movies/search
router.get("/movies/search", movies_controller.search_movie);

// 해당 영화 상세 정보
// GET
// http://{baseUrl}/movies/info/:movieid
router.get("/movies/info/:movieId", movies_controller.movie_info);

// 추천 영화 정보
// GET
// http://{baseUrl}/movies/recommand
router.get("/movies/recommand", movies_controller.movie_recommend);
