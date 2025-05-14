import { get_reviews } from "../db/database.mjs";
import Mongodb, { ReturnDocument } from "mongodb";
import * as UserRepository from "./auth.mjs";
import mongoose from "mongoose";
const ObjectID = Mongodb.ObjectId;

const review_schema = new mongoose.Schema(
  {
    content: String,
    rating: Number,
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// 모든 리뷰를 리턴
export async function getAll() {
  return get_reviews().find().sort({ createAt: -1 }).toArray();
}

// 사용자 닉네임(nickname)에 대한 리뷰를 리턴
// 조건을 만족하는 모든 요소를 배열로 리턴
export async function getAllByUserid(userid) {
  return get_reviews().find({ userid }).sort({ createAt: -1 }).toArray();
}

// 리뷰 인덱스(idx)에 대한 리뷰를 리턴
// 조건을 만족하는 첫 번째 요소 하나를 리턴
export async function getById(id) {
  return get_reviews()
    .find({ _id: new ObjectID(id) })
    .next()
    .then(map_optional_review);
}

// 리뷰 작성
export async function create(text, id) {
  console.log("유저 분별용 object id: ", id);
  return UserRepository.findByid(id).then((user) =>
    get_reviews()
      .insertOne({
        text,
        createAt: new Date(),
        useridx: user.id,
        name: user.name,
        userid: user.userid,
        url: user.url,
      })
      .then((result) => {
        return get_reviews().findOne({ _id: result.insertedId });
      })
  );
}

// 리뷰 변경
export async function update(idx, text) {
  return get_reviews()
    .findOneAndUpdate(
      { _id: new ObjectID(idx) },
      { $set: { text } },
      { returnDocument: "after" }
    )
    .then((result) => result);
}

// 리뷰 삭제
export async function remove(idx) {
  return get_reviews().deleteOne({ _id: new ObjectID(idx) });
}

// 리뷰 평점 정리
export async function ratings(movieId) {}

function map_optional_review(review) {
  return review ? { ...review, id: review._id.toString() } : review;
}
