import mongoose from "mongoose";
import { use_virtual_id } from "../db/database.mjs";

const user_schema = new mongoose.Schema(
  {
    userid: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    nickname: { type: String, required: true },
    hp: { type: String, required: true },
  },
  { versionKey: false, timestamps: true }
);

use_virtual_id(user_schema);

export const User = mongoose.model("user", user_schema);

// 회원 가입(새로운 객체 추가)
export async function create_user(user) {
  return new User(user).save(); // 👉 전체 유저 문서 반환
}

// 아이디 찾기(중복방지)
export async function find_by_userid(userid) {
  return User.findOne({ userid });
}

// user_idx 찾기
export async function find_by_idx(id) {
  return User.findById(id);
}

// unique값인 param1으로 특정한 유저의 필드인 param2, 1개만 반환
export async function find_by_sth(param1, param2) {
  //return User.findOne({ param1 }).select(param2);
  const doc = await User.findOne({ _id: param1 }).select(param2);
  return doc?.[param2];
}

// 비밀번호 찾기(email 사용?)
export async function find_email(email) {
  return User.findOne(email);
}

// 업데이트 수행
export async function update_user_by_id(id, updates) {
  return User.updateOne({ _id: id }, { $set: updates });
}

// id로 유저 삭제
export async function delete_user_by_id(id) {
  return User.deleteOne({ _id: id });
}

// 닉네임 부분 일치로 유저 찾기 (DB의 nickname에서도 공백 제거)
export async function find_by_nickname_regex(nickname) {
  // MongoDB 4.4+에서 $replaceAll 사용 가능
  return await User.find({
    $expr: {
      $regexMatch: {
        input: {
          $replaceAll: { input: "$nickname", find: " ", replacement: "" },
        },
        regex: nickname,
        options: "i",
      },
    },
  });
}
