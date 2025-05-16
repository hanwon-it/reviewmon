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
export async function find_by_idx(user_idx) {
  return User.findById(user_idx);
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

// 정보 수정(닉네임)
export async function post_update_user(id, update_data) {
  const filtered_data = {};

  // 필드 중 null/undefined 아닌 값만 필터링
  if (update_data.password != null) {
    filtered_data.password = update_data.password;
  }
  if (update_data.nickname != null) {
    filtered_data.nickname = update_data.nickname;
  }
  if (update_data.hp != null) {
    filtered_data.hp = update_data.hp;
  }
  if (update_data.email != null) {
    filtered_data.email = update_data.email;
  }
  // 아무 필드도 수정할 게 없다면 null 반환
  if (Object.keys(filtered_data).length === 0) {
    return null;
  }
  // 업데이트 수행
  return User.findByIdAndUpdate(
    id,
    { $set: filtered_data },
    { returnDocument: "after" }
  );
}
