import express from "express";
import * as review_controller from "../controller/reviews.mjs";
import { body } from "express-validator";
import { validate } from "../middleware/validator.mjs";
import { is_auth } from "../middleware/auth.mjs";

const router = express.Router();

const validate_review = [
  body("content").trim().isLength({ min: 5 }).withMessage("최소 5자 이상 입력해 주세요."),
  validate,
];

// 영화별 리뷰 목록
router.get("/movie/:movie_id", review_controller.get_movie_reviews);
// 리뷰 작성
router.post("/movie/:movie_id", validate_review, is_auth, review_controller.create_review);
// 리뷰 수정/삭제
router.patch("/:review_id", validate_review, is_auth, review_controller.update_review);
router.delete("/:review_id", is_auth, review_controller.delete_review);
// 유저별 리뷰 (로그인 필요)
router.get("/user/:nickname", is_auth, review_controller.get_reviews);
// 유저별 좋아요한 리뷰 id 리스트 (로그인 필요)
router.get("/user/me/review-likes", is_auth, review_controller.get_liked_review_ids);
// 리뷰 정렬
router.get("/recommend", review_controller.recommanded_reviews);
router.get("/latest", review_controller.latest_reviews);
router.get("/rate/:updown", review_controller.rating_reviews);
// 리뷰 좋아요/좋아요 취소
router.post('/:review_id/like', is_auth, review_controller.like_review);
router.delete('/:review_id/like', is_auth, review_controller.unlike_review);
// 내가 쓴 리뷰(본인만 접근, 토큰 기반)
router.get("/me", is_auth, review_controller.get_my_reviews);

export default router;
