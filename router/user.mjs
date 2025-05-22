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
    body("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("비밀번호는 최소 6자 이상 입력하세요")
    .matches(/^(?=.*[a-zA-Z0-9])(?=.*[!@#$%^&*]).{6,}$/)
    .withMessage("비밀번호는 영문, 특수문자, 숫자 모두 포함하세요"),
  validate,
];

const validate_signup = [
  ...validate_login,
  body("name").trim().notEmpty().withMessage("이름을 입력하세요"),
  body("email").trim().isEmail().withMessage("이메일 형식을 확인하세요"),
  body("hp").matches(/^01[016789][0-9]{7,8}$/).withMessage("휴대폰 번호는 숫자만 입력하세요\n 예) 01012345678"),
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

const validate_update_user = [
  body("email").optional().trim().isEmail().withMessage("이메일 형식 확인"),
  body("password").optional().trim().isLength({ min: 6 }).withMessage("최소 6자 이상 입력").matches(/^(?=.*[a-zA-Z0-9])(?=.*[!@#$%^&*]).{6,}$/).withMessage("영문, 특수문자, 숫자 모두 포함"),
  body("hp").optional().matches(/^01[016789][0-9]{7,8}$/).withMessage("휴대폰 번호 형식 확인"),
  validate,
];

// 회원가입/로그인/아이디 중복
router.post("/signup", validate_signup, user_controller.signup);
router.post("/login", validate_login, user_controller.login);
router.post("/check-userid", validate_userid_only, user_controller.check_userid);

// 내 정보 조회/수정/탈퇴
router.get("/me", is_auth, user_controller.my_info);
router.patch("/me", is_auth, validate_update_user, user_controller.update_user_info);
router.delete("/me", is_auth, user_controller.signout);

// 비밀번호/아이디 찾기
router.post("/find-pw", user_controller.find_pw_by_email);
router.post("/find-id", user_controller.find_id_by_email);
router.patch("/change-pw", is_auth, user_controller.must_change_pw);

// 취향 정보
router.post("/favorite", is_auth, user_controller.input_favorite);
router.patch("/favorite", is_auth, user_controller.update_favorite);

// 닉네임 검색
router.get("/search/:nickname", user_controller.search_auth);

export default router;
