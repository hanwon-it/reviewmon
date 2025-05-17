import { Movie } from "../data/movie.mjs";
import { Review } from "../data/review.mjs";
import { config } from "../config.mjs";
import fetch from "node-fetch";

const api_key = config.tmdb.api_key;

// ✅ 영화 검색: title(MongoDB) / person(TMDB)
export async function search_movie(req, res) {
  try {
    const { query, type } = req.query;

    if (!query || !type) {
      return res
        .status(400)
        .json({ message: "query와 type을 모두 포함해주세요." });
    }

    if (type === "title") {
      const searchResults = await Movie.find({
        title: { $regex: query, $options: "i" },
      }).sort({ popularity: -1 });

      if (!searchResults || searchResults.length === 0) {
        return res
          .status(404)
          .json({ message: "해당 제목의 영화가 없습니다." });
      }

      return res.json(searchResults);
    }

    if (type === "person") {
      const url = `https://api.themoviedb.org/3/search/person?api_key=${api_key}&query=${encodeURIComponent(
        query
      )}&language=ko-KR`;
      const response = await fetch(url);

      if (!response.ok) {
        return res.status(500).json({ message: "TMDB API 요청 실패" });
      }

      const data = await response.json();
      const results = data.results.map((item) => ({
        movie_id: item.id,
        title: item.name,
        poster_path: item.profile_path,
      }));

      return res.json(results);
    }

    return res.status(400).json({ message: "지원하지 않는 검색 타입입니다." });
  } catch (err) {
    console.error("🎯 검색 오류:", err);
    res.status(500).json({ message: "검색 처리 중 서버 오류 발생" });
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
// 🔧 유틸 함수: movieid로 ObjectId 찾기
async function getMovieObjectId(movieid) {
  const movie = await Movie.findOne({ movieid });
  return movie._id;
}

// ✅ 3. 해당 영화 상세 정보(외부 평점 포함)
export async function movie_info(req, res) {
  try {
    const { movie_id } = req.params;
    const movie = await Movie.findOne({ movie_id });

    if (!movie) return res.status(404).json({ message: "해당 영화 없음" });

    // 리뷰: 해당 영화의 movie_id로, 추천 수(like_cnt) 내림차순 정렬, 최대 10개
    const reviews = await Review.find({ movie_id: movie.movie_id }).sort({
      like_cnt: -1,
    });
    // .limit(10);

    // ⭐ 리뷰 평점 평균 계산
    let avgRating = null;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, cur) => acc + (cur.rating || 0), 0);
      avgRating = sum / reviews.length;
    }

    const fullData = {
      ...movie.toObject(),
      reviews,
      rating: avgRating,
    };

    res.json(fullData);
  } catch (err) {
    console.error("🎯 상세 정보 오류:", err);
    res.status(500).json({ message: "서버 에러 발생" });
  }
}

// ✅ 영화 추천 (랜덤 10개)
export async function getRecommendations(req, res) {
  try {
    const movies = await Movie.find().limit(10); // 샘플
    res.json(movies);
  } catch (err) {
    console.error("🎯 추천 영화 오류:", err);
    res.status(500).json({ message: "추천 영화 불러오기 실패" });
  }
}

// 인기영화
export async function get_popular_movies(req, res) {
  try {
    const movies = await Movie.find({}).sort({ popularity: -1 }).limit(10);
    res.json(movies);
  } catch (error) {
    console.error("🔥 인기 영화 조회 실패:", error);
    res.status(500).json({ message: "서버 오류" });
  }
}
