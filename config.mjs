import dotenv from "dotenv";
dotenv.config();

function required(key, default_value = undefined) {
  const value = process.env[key] || default_value;
  if (value == null) {
    throw new Error(`키 ${key}는(은) undefined 입니다.`);
  }
  return value;
}

export const config = {
  jwt: {
    secret_key: required("JWT_SECRET"),
    expires_in_sec: parseInt(required("JWT_EXPIRES_SEC", 86400)),
  },
  bcrypt: {
    salt_rounds: parseInt(required("BCRYPT_SALT_ROUNDS"), 10),
  },
  db: {
    host: required("DB_HOST"),
    name: required("DB_NAME"),
    url: `${required("DB_HOST").replace(/\/\?/, `/${required("DB_NAME")}?`)}`,
  },
  host: {
    port: parseInt(required("HOST_PORT"), 8080),
  },
  tmdb: {
    api_key: required("TMDB_API_KEY"),
  },
  email: {
    user: required("ADMIN_EMAIL"),
    pass: required("EMAIL_PASS"),
  },
};
