import { Movie } from "../data/movie.mjs";
import { Review } from "../data/review.mjs";

// ✅ 1. 영화 검색 결과
export async function search_movie(req, res) {
  try {
    const { type, text } = req.body;
    console.log(req.body);

    const searchResults = await Movie.find().sort({ popularity: -1 });
    // recommands에서
    // 1. 쿼리문으로 평점순 정렬 등 노출 방식을 결정함(현재로선 이 방식)
    // 2. 기존 추천 알고리즘을 병합해 해당 방식으로 검색결과를 정렬시켜 노출함
    if ((searchResults = null)) {
      res.status(400).json({ message: "검색 결과가 없습니다." });
    } else {
      res.json(searchResults);
    }
  } catch (err) {
    res.status(500).json({ error: "영화 검색 실패" });
  }
}

// ✅ 2. 해당 영화의 전체 리뷰 목록
export async function movie_review_list(req, res) {
  const { movie_id } = req.id;
  try {
    const reviews = await Review.find({
      movie: await getMovieObjectId(movie_id),
    }).populate("user", "username");
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "리뷰 조회 실패" });
  }
}

// ✅ 3. 해당 영화 상세 정보
export async function movie_info(req, res) {
  try {
    const { movie_id } = req.params.movie_id;

    // 1. 영화 기본 정보 + 감독, 배우
    const movie = await movie.findOne({ movie_id: movie_id }); //tmdb api 양식: https://api.themoviedb.org/3/search/person?api_key=1dc4fbac48abb39eeb4fbd6c9d845bd3&query={person}으로 교체 예정
    if (!movie) return res.status(404).json({ message: "영화 없음" });

    // 2. 외부 평점 정보
    const ratingOut = await MovieRatingOut.findOne({
      original_title: movie.original_title,
    });

    // 3. 통합 응답 구성
    const fullData = {
      ...movie.toObject(),
      rating_out: ratingOut ? ratingOut.rating_out : null,
    };

    res.status(200).json(fullData);
  } catch (err) {
    console.error("getFullMovieInfo error:", err);
    res.status(500).json({ message: "서버 에러" });
  }

  // 🔧 유틸 함수: movieid로 ObjectId 찾기
  async function getMovieObjectId(movieid) {
    const movie = await Movie.findOne({ movieid });
    return movie._id;
  }
} // mongoose 양식으로 변환 예정
