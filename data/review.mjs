import Mongoose from "mongoose";
import { use_virtual_id } from "../db/database.mjs";

const review_schema = new Mongoose.Schema(
  {
    content: { type: String, require: true },
    rating: { type: Number, require: true },
    nickname: { type: String, require: true },
    movie_title: { type: String, require: true },
    like_cnt: { type: Number, require: true },
  },
  { versionKey: false },
  { timestamps: true }
);

use_virtual_id(review_schema);

const review = Mongoose.model("review", review_schema);

// 새로운 리뷰 등록
export async function post_review(review_info) {
  return new review(review_info).save().then((data) => data.id);
}

// 리뷰 수정
export async function post_update(id, text) {
  return review.findByIdAndUpdate(id, { text }, { returnDocument: "after" });
}

// 리뷰 삭제
export async function post_delete(id) {
  return review.findByIdAndDelete(id);
}

// 좋아요 버튼 작동

//
