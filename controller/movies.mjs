import mongoose from "mongoose";
import { movie_schema } from "../data/movies.mjs";
import { review_schema } from "../data/reviews.mjs";
import { rating_out_schema } from "../data/rating_out.mjs";

// ✅ 1. 전체 영화 목록 (최근 등록순)
export async function all_movie_list(req, res) {
  try {
    const movies = await movie_schema.find().sort({ _id: -1 }); // MongoDB ObjectId는 등록순
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: "영화 목록 불러오기 실패" });
  }
}

// 영화 검색 결과
export async function search_movie(req, res) {
  try {
    const searchResults = await movie_schema.find().sort({ recommands });
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
  const { movieid } = req.params;
  try {
    const reviews = await review_schema
      .find({
        movie: await getMovieObjectId(movieid),
      })
      .populate("user", "username");
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "리뷰 조회 실패" });
  }
}

// ✅ 3. 해당 영화 상세 정보
export async function movieInfo(req, res) {
  const { movieid } = req.params;
  try {
    const movie = await movie_schema.findOne({ movieid });
    if (!movie) return res.status(404).json({ error: "영화 없음" });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: "영화 조회 실패" });
  }
}

// 🔧 유틸 함수: movieid로 ObjectId 찾기
async function getMovieObjectId(movieid) {
  const movie = await movie_schema.findOne({ movieid });
  return movie?._id;
}
