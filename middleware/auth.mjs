import jwt from "jsonwebtoken";
import * as auth_repository from "../data/user.mjs";
import { config } from "../config.mjs";

const AUTH_ERROR = { message: "인증 에러" };

export const is_auth = async (req, res, next) => {
  const auth_header = req.get("Authorization");
  console.log("Authorization:", auth_header);

  if (!(auth_header && auth_header.startsWith("Bearer "))) {
    console.log("헤더 에러");
    return res.status(401).json(AUTH_ERROR);
  }

  const token = auth_header.split(" ")[1];
  console.log("Token:", token);

  try {
    const decoded = jwt.verify(token, config.jwt.secret_key);
    console.log("decoded.userid:", decoded.userid);

    const user = await auth_repository.find_by_userid(decoded.userid);
    if (!user) {
      console.log("등록된 적 없음");
      return res.status(401).json(AUTH_ERROR);
    }

    req.userid = user.userid; // userid를 저장
    next();
  } catch (error) {
    console.log("토큰 에러", error);
    return res.status(401).json(AUTH_ERROR);
  }
};
