import { Movie } from "../data/movie.mjs";
import { Review } from "../data/review.mjs";
import { config } from "../config.mjs";
import fetch from "node-fetch";

const api_key = config.tmdb.api_key;

const creditsCache = new Map();

async function getCredits(movieId) {
  if (creditsCache.has(movieId)) return creditsCache.get(movieId);
  const url = `https://api.themoviedb.key=${api_key}&language=ko-KR`;
  const res = await fetch(url);
  const data = await res.json();
  creditsCache.set(movieId, data);
  return data;
}

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
      // 검색어에서 공백 모두 제거
      const normalizedQuery = query.replace(/\s/g, "");

      // Aggregation으로 title의 공백을 모두 제거해서 비교
      const searchResults = await Movie.aggregate([
        {
          $addFields: {
            title_no_space: { $replaceAll: { input: "$title", find: " ", replacement: "" } }
          }
        },
        {
          $match: {
            title_no_space: { $regex: normalizedQuery, $options: "i" }
          }
        },
        { $sort: { popularity: -1 } }
      ]);

      if (!searchResults || searchResults.length === 0) {
        return res
          .status(404)
          .json({ message: "해당 제목의 영화가 없습니다." });
      }

      return res.json(searchResults);
    }

    if (type === "person") {
      // 내부 DB에서 감독/배우 이름으로 검색 (한글/영문 모두 포함)
      const searchResults = await Movie.find({
        $or: [
          { "director.name": { $regex: query, $options: "i" } },
          { "cast.name": { $regex: query, $options: "i" } }
        ]
      }).sort({ popularity: -1 });

      // 내부 DB에 결과가 있으면 바로 반환
      if (searchResults && searchResults.length > 0) {
        return res.json(searchResults);
      }

      // 내부 DB에 없으면 TMDB API로 검색 (한글 지원)
      try {
        const url = `https://api.themoviedb.org/3/search/person?api_key=${api_key}&query=${encodeURIComponent(query)}`;
        const tmdb_res = await fetch(url);
        const data = await tmdb_res.json();
        if (!data.results || data.results.length === 0) {
          return res.status(404).json({ message: "해당 인물이 참여한 영화가 없습니다." });
        }
        // 배우/감독별 영화 분리
        let castMovies = [];
        let directorMovies = [];
        for (const person of data.results) {
          const creditsUrl = `https://api.themoviedb.org/3/person/${person.id}/combined_credits?api_key=${api_key}&language=ko-KR`;
          const creditsRes = await fetch(creditsUrl);
          const creditsData = await creditsRes.json();
          // 배우로 출연한 영화
          if (creditsData.cast) {
            castMovies = castMovies.concat(
              creditsData.cast
                .filter(item => item.poster_path)
                .map(item => ({
                  movie_id: item.id,
                  title: item.title || item.name,
                  poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
                  overview: item.overview || '',
                  release_date: item.release_date || '',
                  popularity: item.popularity || 0,
                  person_name: person.name,
                  person_profile: person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : null,
                  character: item.character || '',
                }))
            );
          }
          // 감독으로 참여한 영화
          if (creditsData.crew) {
            directorMovies = directorMovies.concat(
              creditsData.crew
                .filter(item => item.job === 'Director' && item.poster_path)
                .map(item => ({
                  movie_id: item.id,
                  title: item.title || item.name,
                  poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
                  overview: item.overview || '',
                  release_date: item.release_date || '',
                  popularity: item.popularity || 0,
                  person_name: person.name,
                  person_profile: person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : null,
                }))
            );
          }
        }
        // 중복 제거 (movie_id 기준)
        const uniqueCastMovies = [];
        const seenCast = new Set();
        for (const movie of castMovies) {
          if (!seenCast.has(movie.movie_id)) {
            seenCast.add(movie.movie_id);
            uniqueCastMovies.push(movie);
          }
        }
        const uniqueDirectorMovies = [];
        const seenDirector = new Set();
        for (const movie of directorMovies) {
          if (!seenDirector.has(movie.movie_id)) {
            seenDirector.add(movie.movie_id);
            uniqueDirectorMovies.push(movie);
          }
        }
        return res.json({
          people: data.results,
          castMovies: uniqueCastMovies,
          directorMovies: uniqueDirectorMovies
        });
      } catch (err) {
        console.error("TMDB 인물 검색 오류:", err);
        return res.status(500).json({ message: "TMDB 인물 검색 오류" });
      }
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

// ✅ 영화 추천 로직 (좋아하는 배우/감독 출연/연출작 기반)
export async function getRecommendations(req, res) {
  try {
    const user_idx = req.id;
    if (!user_idx) return res.status(401).json({ message: "로그인 필요" });

    const { Favorite } = await import("../data/favorite.mjs");
    const TMDB_API_KEY = config.tmdb.api_key;
    const favorite = await Favorite.findOne({ user_idx });
    if (!favorite) return res.status(200).json([]);

    const genreIds = (favorite.gerne || []).filter(Boolean).map(Number);
    const actorIds = (favorite.actor || []).map(a => String(a.id)).filter(Boolean);
    const directorIds = (favorite.director || []).map(d => String(d.id)).filter(Boolean);
    const allPersonIds = [...new Set([...actorIds, ...directorIds])];
    if (allPersonIds.length === 0) return res.status(200).json([]);

    // 1. 배우/감독별 출연/연출작 병렬 fetch
    const creditsList = await Promise.all(
      allPersonIds.map(async (id) => {
        try {
          const url = `https://api.themoviedb.org/3/person/${id}/combined_credits?api_key=${TMDB_API_KEY}&language=ko-KR`;
          const res = await fetch(url);
          return await res.json();
        } catch (err) {
          return { cast: [], crew: [] };
        }
      })
    );

    // 2. 영화 합집합(중복 제거)
    const movieMap = new Map();
    for (const credits of creditsList) {
      for (const item of [...(credits.cast || []), ...(credits.crew || [])]) {
        // 포스터, 한글 제목 있는 영화만
        if (!movieMap.has(item.id) && item.poster_path && item.title && /[가-힣]/.test(item.title)) {
          movieMap.set(item.id, item);
        }
      }
    }
    let movies = Array.from(movieMap.values());
    if (movies.length === 0) return res.status(200).json([]);

    // 3. 장르 일치 개수로 점수 부여
    const scoredMovies = movies.map(m => {
      const genreMatch = (m.genre_ids || []).filter(id => genreIds.includes(id)).length;
      // 배우/감독 일치 여부(내가 좋아하는 인물과 실제 출연/연출 인물 id 비교)
      let actorMatch = 0, directorMatch = 0;
      if (actorIds.length && m.cast && Array.isArray(m.cast)) {
        actorMatch = m.cast.filter(c => actorIds.includes(String(c.id))).length;
      }
      if (directorIds.length && m.crew && Array.isArray(m.crew)) {
        directorMatch = m.crew.filter(c => c.job === 'Director' && directorIds.includes(String(c.id))).length;
      }
      // 점수: 배우*100 + 감독*10 + 장르*1
      const score = actorMatch * 100 + directorMatch * 10 + genreMatch * 1;
      return { ...m, genreMatch, actorMatch, directorMatch, score };
    });

    // 4. 점수순/인기순 정렬 후 20개 반환
    scoredMovies.sort((a, b) => b.score - a.score || b.popularity - a.popularity);
    const topMovies = scoredMovies.slice(0, 20);

    // 5. 필요한 필드만 반환
    const result = topMovies.map(m => ({
      movie_id: m.id,
      title: m.title,
      poster_path: m.poster_path,
      overview: m.overview,
      popularity: m.popularity,
      release_date: m.release_date,
    }));

    res.json(result);
  } catch (err) {
    console.error("🎯 추천 영화 오류:", err);
    res.status(500).json({ message: "추천 영화 불러오기 실패" });
  }
}

// 인기영화
export async function get_popular_movies(req, res) {
  try {
    const movies = await Movie.find({}).sort({ popularity: -1 }).limit(20);
    res.json(movies);
  } catch (error) {
    console.error("🔥 인기 영화 조회 실패:", error);
    res.status(500).json({ message: "서버 오류" });
  }
}


// TMDB 인물 검색 프록시 (이것만 남기세요)
export async function search_person(req, res) {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: "query 필요" });
  const TMDB_API_KEY = config.tmdb.api_key;
  try {
    const url = `https://api.themoviedb.org/3/search/person?api_key=${TMDB_API_KEY}&language=ko-KR&query=${encodeURIComponent(query)}`;
    const tmdbRes = await fetch(url);
    const data = await tmdbRes.json();
    res.json(data);
  } catch (err) {
    console.error("TMDB 인물 검색 실패:", err);
    res.status(500).json({ message: "TMDB 인물 검색 실패" });
  }
}

// 배우/감독 클릭시 해당 사람 아이디로 영화 불러오기
export async function get_person_credits(req, res) {
  const { person_id } = req.query;
  if (!person_id)
    return res.status(400).json({ message: "person_id가 필요합니다." });

  try {
    const url = `https://api.themoviedb.org/3/person/${person_id}/combined_credits?api_key=${api_key}&language=ko-KR`;
    const response = await fetch(url);
    const data = await response.json();

    const works = data.cast
      .filter((item) => item.poster_path)
      .slice(0, 20)
      .map((item) => ({
        id: item.id,
        title: item.title || item.name,
        poster_path: item.poster_path,
      }));

    res.status(200).json(works);
  } catch (err) {
    console.error("출연작 조회 실패:", err);
    res.status(500).json({ message: "TMDB 요청 실패" });
  }
}

// TMDB 인물 기본 정보 프록시
export async function get_person_info(req, res) {
  const { person_id } = req.params;
  if (!person_id) return res.status(400).json({ message: "person_id가 필요합니다." });
  try {
    const url = `https://api.themoviedb.org/3/person/${person_id}?api_key=${api_key}&language=ko-KR`;
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("TMDB 인물 정보 프록시 오류:", err);
    res.status(500).json({ message: "TMDB 인물 정보 프록시 오류" });
  }
}

// TMDB 인물 출연/감독작 프록시
export async function get_person_credits_proxy(req, res) {
  const { person_id } = req.params;
  if (!person_id) return res.status(400).json({ message: "person_id가 필요합니다." });
  try {
    const url = `https://api.themoviedb.org/3/person/${person_id}/combined_credits?api_key=${api_key}&language=ko-KR`;
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("TMDB 인물 크레딧 프록시 오류:", err);
    res.status(500).json({ message: "TMDB 인물 크레딧 프록시 오류" });
  }
}

