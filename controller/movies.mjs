import { Movie } from "../data/movie.mjs";
import { Review } from "../data/review.mjs";
import { config } from "../config.mjs";
import fetch from "node-fetch";

const api_key = config.tmdb.api_key;

// ✅ 1. 영화 검색 결과
export async function search_movie(req, res) {
  try {
    const { type, text } = req.body;

    if (!type || !text) {
      return res
        .status(400)
        .json({ message: "검색할 대상과 검색값을 모두 입력하세요." });
    }

    // 제목 검색
    if (type === "title") {
      // 정규식으로 유사 검색 (대소문자 구분 없음)
      const searchResults = await Movie.find({
        title: { $regex: text, $options: "i" },
      }).sort({ popularity: -1 }); // 일단 인기도 정렬

      if (!searchResults || searchResults.length === 0) {
        return res
          .status(404)
          .json({ message: "해당 제목의 영화가 없습니다." });
      }

      return res.json(searchResults);
    }

    // 인물 검색
    if (type === "person") {
      const url = `https://api.themoviedb.org/3/search/person?api_key=${api_key}&query=${text};`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("TMDB 요청 실패");
      }

      const data = await response.json();
      return res.json(data); // TMDB 결과 그대로 클라이언트에 전달
    }

    // type이 둘 다 아닐 경우
    return res.status(400).json({ message: "지원하지 않는 검색 대상입니다." });
  } catch (err) {
    console.error("영화 검색 오류:", err);
    res.status(500).json({ error: "영화 검색 중 서버 오류 발생" });
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

// ✅ 3. 해당 영화 상세 정보(외부 평점 포함)
// 일단 movie_id로 movie 테이블 전첼 가져오는 데엔 성공...
// title 검색 결과와 같은 수준의 정보 제공은 가능.
export async function movie_info(req, res) {
  try {
    const { movie_id } = req.params;
    console.log(movie_id);

    // 1. 영화 기본 정보 + 감독, 배우
    const movie = await Movie.findOne({ movie_id: movie_id });
    if (!movie) return res.status(404).json({ message: "영화 없음" });

    // 2. 외부 평점 정보
    /*
    const ratingOut = await MovieRatingOut.findOne({
      original_title: movie.original_title,
    });
    */
    // 3. 통합 응답 구성
    const fullData = {
      ...movie.toObject(),
      //rating_out: ratingOut ? ratingOut.rating_out : null,
    };

    res.status(200).json(fullData);
  } catch (err) {
    console.error("getFullMovieInfo error:", err);
    res.status(500).json({ message: "서버 에러" });
  }
}

// 🔧 유틸 함수: movieid로 ObjectId 찾기
async function getMovieObjectId(movieid) {
  const movie = await Movie.findOne({ movieid });
  return movie._id;
}
// mongoose 양식으로 변환 예정

// 영화 추천
export const getRecommendations = async (req, res) => {
  const userId = req.params.userId;

  // 실제 DB 로직은 나중에 넣고 지금은 랜덤 10개 샘플 리턴
  const movies = await Movie.find().limit(10); // 임시

  res.json(movies);
};

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
