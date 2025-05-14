import Mongodb from "mongodb";
import { get_users } from "../db/database.mjs";
import { Result } from "express-validator";
const ObjectID = Mongodb.ObjectId;

export async function create_user(user) {
  return get_users()
    .insertOne(user)
    .then((result) => result.insertedId.toString()); //insertedId: 삽입된 객체 요소의 objectId를 반환
}

export async function login(userid, password) {
  const user = users.find(
    (user) => user.userid === userid && user.password === password
  );
  return user;
}

export async function find_by_userid(userid) {
  return get_users().find({ userid }).next().then(map_optional_user);
}

//아이디를 바탕으로 옵젝 아이디를 새로 생성
export async function find_by_id(id) {
  return get_users()
    .find({ _id: new ObjectID(id) })
    .next()
    .then(map_optional_user);
}

function map_optional_user(user) {
  return user ? { ...user, id: user._id.toString() } : user;
}
