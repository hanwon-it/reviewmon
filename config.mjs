//OMDB, TMDB 관련 코드 병합 필요.
//MongoDB는 기존 코드에 변형하는 식으로 구현 예정.

import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
let tmdbConfig = null;

function required(key, defaultValue = undefined) {
  const value = process.env[key] || defaultValue;
  if (value == null) {
    throw new Error(`키 ${key}는 undefined!!`);
  }
  return value;
}

export const config = {
  jwt: {
    secret_key: required("JWT_SECRET"),
    expires_in_sec: parseInt(required("JWT_EXPIRES_SEC", 86400)),
  },
  bcrypt: {
    salt_rounds: parseInt(required("BCRYPT_SALT_ROUNDS", 10)),
  },
  host: {
    port: parseInt(required("HOST_PORT", 8080)),
  },
  db: {
    host: required("DB_HOST"),
  },
};

const fetchTMDBConfig = async () => {
  if (tmdbConfig) return tmdbConfig;

  const { data } = await axios.get(
    "https://api.themoviedb.org/3/configuration",
    {
      params: { api_key: process.env.TMDB_API_KEY },
    }
  );

  tmdbConfig = data.images;
  return tmdbConfig;
};

module.exports = { fetchTMDBConfig };
