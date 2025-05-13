import axios from "axios";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Movie } from "./data/movie.mjs"; // 스키마 파일
import { config } from "./config.mjs"; // config.mjs에서 DB URL 불러옴

dotenv.config();

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3/discover/movie";
const BATCH_SIZE = 30;
const DELAY_MS = 1000;
const START_YEAR = 2000;
const END_YEAR = 2025;

const ALLOWED_LANGUAGES = [
  "ko",
  "en",
  "zh",
  "fr",
  "de",
  "es",
  "pt",
  "ru",
  "id",
  "ja",
  "vi",
  "th",
  "hi",
];

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function getMonthRange(year, month) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return {
    gte: formatDate(start),
    lte: formatDate(end),
  };
}

async function fetchMoviesByDateRange(gte, lte, page) {
  const url = `${BASE_URL}?api_key=${API_KEY}&language=ko-KR&sort_by=popularity.desc&primary_release_date.gte=${gte}&primary_release_date.lte=${lte}&page=${page}`;
  const { data } = await axios.get(url);
  return {
    movies: data.results || [],
    totalPages: Math.min(data.total_pages || 1, 500),
  };
}

async function insertMovies(movies) {
  for (const movie of movies) {
    // 필수값 검사
    if (
      !movie.id ||
      !movie.title ||
      !movie.release_date ||
      !/^\d{4}-\d{2}-\d{2}$/.test(movie.release_date)
    ) {
      console.warn(`⚠️ 패스됨 (누락된 필수값): ${movie.title}`);
      continue;
    }

    const lang = movie.original_language;
    if (!ALLOWED_LANGUAGES.includes(lang)) {
      console.warn(`⛔️ 언어 제외됨 (${lang}): ${movie.title}`);
      continue;
    }

    const doc = {
      movieId: movie.id,
      title: movie.title,
      overview: movie.overview || "",
      releaseDate: movie.release_date,
      posterPath: movie.poster_path || null,
      originalTitle: movie.original_title || null,
      genreIds: movie.genre_ids || [],
      popularity:
        typeof movie.popularity === "number" ? movie.popularity : null,
      originalLanguage: lang,
    };

    await Movie.updateOne(
      { movieId: movie.id },
      { $set: doc },
      { upsert: true }
    );
    console.log(`📥 저장: [${movie.release_date}] ${movie.title} (${lang})`);
  }
}

async function fetchAndInsertByMonth() {
  await mongoose.connect(config.db.url);
  console.log("✅ MongoDB 연결 완료");

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    for (let month = 0; month < 12; month++) {
      const { gte, lte } = getMonthRange(year, month);
      console.log(`📅 ${gte} ~ ${lte} 수집 시작`);

      const { movies: firstMovies, totalPages } = await fetchMoviesByDateRange(
        gte,
        lte,
        1
      );
      if (firstMovies.length === 0) {
        console.log(`⚠️ ${gte} ~ ${lte} 데이터 없음`);
        continue;
      }

      for (let i = 0; i < firstMovies.length; i += BATCH_SIZE) {
        const batch = firstMovies.slice(i, i + BATCH_SIZE);
        await insertMovies(batch);
        if (i + BATCH_SIZE < firstMovies.length) await delay(DELAY_MS);
      }

      for (let page = 2; page <= totalPages; page++) {
        console.log(`📄 ${gte} ~ ${lte} - 페이지 ${page}`);
        const { movies } = await fetchMoviesByDateRange(gte, lte, page);
        if (!movies.length) break;

        for (let i = 0; i < movies.length; i += BATCH_SIZE) {
          const batch = movies.slice(i, i + BATCH_SIZE);
          await insertMovies(batch);
          if (i + BATCH_SIZE < movies.length) await delay(DELAY_MS);
        }

        await delay(DELAY_MS);
      }

      console.log(`✅ ${gte} ~ ${lte} 수집 완료`);
    }
  }

  await mongoose.disconnect();
  console.log("🎉 전체 월별 수집 완료");
}

fetchAndInsertByMonth().catch(console.error);
