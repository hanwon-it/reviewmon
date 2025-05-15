import dotenv from "dotenv";
dotenv.config();

function required(key, defaultValue = undefined) {
  const value = process.env[key] || defaultValue;
  if (value == null) {
    throw new Error(`키 ${key}는(은) undefined 입니다.`);
  }
  return value;
}

export const config = {
  jwt: {
    secretKey: required("JWT_SECRET"),
    expiresInSec: parseInt(required("JWT_EXPIRES_SEC", 86400)),
  },
  bcrypt: {
    saltRounds: parseInt(required("BCRYPT_SALT_ROUNDS"), 10),
  },
  db: {
    host: required("DB_HOST"),
    name: required("DB_NAME"),
    url: `${required("DB_HOST").replace(/\/\?/, `/${required("DB_NAME")}?`)}`,
  },
  host: {
    port: parseInt(required("HOST_PORT"), 8080),
  },
};
