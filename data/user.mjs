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
    activity_point: { type: Number, default: 0 },
    is_temp_pw: { type: Boolean, default: false }, // true일 시 임시 비번.
    last_temp_pw_request: Date, // 가장 최근 임시 비번 발급 요구한 시점.
    temp_pw_request_count: { type: Number, default: 0 }, // 임시 비번 요구 회수.
  },
  { versionKey: false, timestamps: true }
);

use_virtual_id(user_schema);

export const User = mongoose.model("user", user_schema);

// 회원 가입(새로운 객체 추가)
export async function create_user(user) {
  return new User(user).save(); // 👉 전체 유저 문서 반환
}

// 아이디 찾기
export async function find_email(email, name) {
  return User.findOne({ email, name }).select("userid");
}
// 비번 찾기
export async function find_pw(email, userid) {
  return User.findOne({ email, userid });
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
        input: { $replaceAll: { input: "$nickname", find: " ", replacement: "" } },
        regex: nickname,
        options: "i"
      }
    }
  });
}


export async function atomic_temp_pw_request_check(email, userid) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const user = await User.findOne({ email, userid });

  if (!user)
    return {
      success: false,
      status: 404,
      message: "일치하는 사용자가 없습니다.",
    };

  const last_request_day = user.last_temp_pw_request
    ? new Date(user.last_temp_pw_request).toISOString().slice(0, 10)
    : null;

  if (last_request_day === today) {
    if (user.temp_pw_request_count >= 3) {
      return {
        success: false,
        status: 429,
        message: "임시 비밀번호 발급은 1일 3회까지만 가능합니다.",
      };
    }

    // 동일 날짜 → count + 1
    await User.updateOne(
      { _id: user._id },
      {
        $inc: { temp_pw_request_count: 1 },
        $set: { last_temp_pw_request: now },
      }
    );
  } else {
    // 날짜 다름 → count 리셋
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          temp_pw_request_count: 1,
          last_temp_pw_request: now,
        },
      }
    );
  }

  return { success: true, user };
}
