import Mongoose from "mongoose";
import { use_virtual_id } from "../db/database.mjs";

const user_schema = new Mongoose.Schema(
  {
    userid: { type: String, require: true },
    password: { type: String, require: true },
    name: { type: String, require: true },
    email: { type: String, require: true },
    nickname: { type: String, require: true },
    hp: { type: String, require: true },
  },
  { versionKey: false },
  { timestamps: true }
);

use_virtual_id(user_schema);

const user = Mongoose.model("user", user_schema);

// 회원 가입(새로운 객체 추가)
export async function create_user(user_info) {
  return new user(user_info).save().then((data) => data.id);
}

// 아이디 찾기(중복방지)
export async function find_by_userid(userid) {
  return user.findOne({ userid });
}

export async function find_by_id(id) {
  return user.findById(id);
}

// 비밀번호 찾기(email 사용?)
export async function find_email(email) {
  return user.findone(email);
}

// 정보 수정(닉네임)
