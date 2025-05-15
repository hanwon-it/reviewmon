import Mongoose from "mongoose";
import { use_virtual_id } from "../db/database.mjs";

const review_schema = new Mongoose.Schema(
  {
    content: { type: String, require: true },
    rating: { type: Number, require: true },
    nickname: { type: String, require: true },
    movie_title: { type: String, require: true },
    like_cnt: { type: Number, require: true },
    user_idx: { type: String },
  },
  { versionKey: false, timestamps: true }
);

use_virtual_id(review_schema);

const Review = Mongoose.model("review", review_schema);

// 새로운 리뷰 등록
export async function post_review(review_info) {
  return new Review(review_info).save().then((data) => data.id);
}

// 리뷰 수정
export async function post_update(id, text) {
  return Review.findByIdAndUpdate(id, { text }, { returnDocument: "after" });
}

// 리뷰 삭제
export async function post_delete(id) {
  return Review.findByIdAndDelete(id);
}

// 좋아요 버튼 작동

// 좋아요 스키마 생성
const like_schema = new Mongoose.Schema({
  user_id: { type: Mongoose.Schema.Types.ObjectId, ref: "User" },
  review_id: { type: Mongoose.Schema.Types.ObjectId, ref: "Review" },
  created_at: { type: Date, default: Date.now },
});

const Like = Mongoose.model("like", like_schema);

//// 좋아요 추가
export async function likeReview(user_id, review_id) {
  // 1. 이미 좋아요 눌렀는지 확인
  const existing = await Like.findOne({ user_id, review_id });
  if (existing) return { status: "already liked" };

  // 2. 새로 생성
  await Like.create({ user_id, review_id });

  // 3. (선택) 리뷰 좋아요 수 업데이트
  await Review.updateOne({ _id: review_id }, { $inc: { like_count: 1 } });

  return { status: "liked" };
}

// 좋아요 취소
export async function unlikeReview(user_id, review_id) {
  await Like.deleteOne({ user_id, review_id });
  await Review.updateOne({ _id: review_id }, { $inc: { like_count: -1 } });

  return { status: "unliked" };
}
