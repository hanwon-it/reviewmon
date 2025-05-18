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

const validate_userid_only = [
  body("userid")
    .trim()
    .isLength({ min: 4 })
    .withMessage("최소 4자 이상 입력")
    .matches(/^[a-zA-Z0-9]*$/)
    .withMessage("특수문자는 사용 불가"),
  validate,
];

// ✅ 수정된 라우터 등록
router.post("/check-userid", validate_userid_only, user_controller.check_userid);

// 2. 로그인
// POST
// http://{baseUrl}/auth/login
// 회원가입/로그인/아이디 중복
router.post("/signup", validate_signup, user_controller.signup);
router.post("/login", validate_login, user_controller.login);
router.post("/check-userid", validate_userid_only, user_controller.check_userid);

// 내 정보 조회/수정/탈퇴
router.get("/me", is_auth, user_controller.my_info);
router.patch("/me", is_auth, user_controller.update_user_info);
router.delete("/me", is_auth, user_controller.signout);

// 비밀번호/아이디 찾기
router.post("/find-pw", user_controller.find_pw_by_email);
router.post("/find-id", user_controller.find_id_by_email);

// 취향 정보
router.post("/favorite", is_auth, user_controller.input_favorite);
router.patch("/favorite", is_auth, user_controller.update_favorite);

// 닉네임 검색
router.get("/search/:nickname", user_controller.search_auth);

export default router;
