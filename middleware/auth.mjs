import jwt from "jsonwebtoken";
import * as auth_repository from "../data/user.mjs";
import { config } from "../config.mjs";

const AUTH_ERROR = { message: "인증 에러" };

export const is_auth = async (req, res, next) => {
  const auth_header = req.get("Authorization");
  console.log(auth_header);

  if (!(auth_header && auth_header.startsWith("Bearer "))) {
    console.log("헤더 에러");
    return res.status(401).json(AUTH_ERROR);
  }
  const token = auth_header.split(" ")[1];
  console.log(token);

  jwt.verify(token, config.jwt.secret_key, async (error, decoded) => {
    if (error) {
      console.log("토큰 에러");
      return res.status(401).json(AUTH_ERROR);
    }
    console.log(decoded.id);
    const user = await auth_repository.find_by_id(decoded.id);
    if (!user) {
      console.log("등록된 적 없음");
      return res.status(401).json(AUTH_ERROR);
    }
    console.log("user.id: ", user.id);
    console.log("user.userid: ", user.userid);
    req.id = user.id; //리퀘 아이디=옵젝 아이디
    next();
  });
};
