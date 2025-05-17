import express from "express";
import * as user_controller from "../controller/user.mjs";
import { body } from "express-validator";
import { validate } from "../middleware/validator.mjs";
import { is_auth } from "../middleware/auth.mjs";

const router = express.Router();

const validate_login = [
  body("userid")
    .trim()
    .isLength({ min: 4 })
    .withMessage("최소 4자이상 입력")
    .matches(/^[a-zA-Z0-9]*$/)
    .withMessage("특수문자는 사용불가"),
  body("password").trim().isLength({ min: 8 }).withMessage("최소 8자이상 입력"),
  validate,
];

const validate_signup = [
  ...validate_login,
  body("name").trim().notEmpty().withMessage("name을 입력"),
  body("email").trim().isEmail().withMessage("이메일 형식 확인"),
  validate,
];

// 1. 회원가입
router.post("/signup", validate_signup, user_controller.signup);

// 1-1. 아이디 중복 체크
const validate_userid_only = [
  body("userid")
    .trim()
    .isLength({ min: 4 })
    .withMessage("최소 4자 이상 입력")
    .matches(/^[a-zA-Z0-9]*$/)
    .withMessage("특수문자는 사용 불가"),
  validate,
];

router.post(
  "/check-userid",
  validate_userid_only,
  user_controller.check_userid
);

// 2. 로그인
router.post("/login", validate_login, user_controller.login);

// // 3. 로그아웃
// // POST
// // http://{baseUrl}/auth/logout
// router.post("/auth/logout", validate_logout, user_controller.logout); //controller 로그아웃 함수 필요

// 4. 내 회원 정보 가져오기
// GET
// http://{baseUrl}/auth/me
router.get("/me", is_auth, user_controller.my_info); //controller 함수 필요

// // 5. 비밀번호 찾기
// // POST
// // http://{baseUrl}/auth/find-pw
// router.post("/auth/find-pw", user_controller.find_pw_by_email); //controller 함수 필요

// // 6. 아이디 찾기
// // POST
// // http://{baseUrl}/auth/find-id
// router.post("/auth/find-id", user_controller.find_id_by_email); //controller 함수 필요

// 7. 내 회원 정보 수정
// PATCH
// http://{baseUrl}/auth/me
router.patch("/update", is_auth, user_controller.update_user_info); //controller 함수 필요

// // 8. 탈퇴
// // DELETE
// // http://{baseUrl}/auth/signout
// router.delete("/auth/signout", user_controller.signout); //controller 함수 필요

// // 9. 내 취향 정보 입력
// // POST
// // http://{baseUrl}/auth/favorite
// router.post("/auth/favorite", user_controller.input_favorite); //controller 함수 필요

// // 10. 내 취향 정보 수정
// // PATCH
// // http://{baseUrl}/auth/favorite
// router.patch("/auth/favorite", user_controller.update_favorite); //controller 함수 필요

// // 11. 유저 닉네임 검색
// // GET
// // http://{baseUrl}/auth/search/:nickname
// router.get("/auth/search/:nickname", user_controller.search_auth); //controller 함수 필요

export default router;
