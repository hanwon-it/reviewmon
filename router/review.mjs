import express from "express";
import * as review_controller from "../controller/reviews.mjs";
import { body } from "express-validator";
import { validate } from "../middleware/validator.mjs";
import { is_auth } from "../middleware/auth.mjs";

const router = express.Router();

const validate_review = [
  body("content")
    .trim()
    .isLength({ min: 5 })
    .withMessage("최소 5자 이상 입력해 주세요."),
  validate,
];

// 리뷰 API
// http://{baseUrl}/reviews/

// 1. 해당 유저nickname가 작성한 리뷰 가져오기
// GET
// http://{baseUrl}/reviews/search/:nickname
router.get("/search/:nickname", is_auth, review_controller.get_reviews);

// 2. 해당 영화 전체 리뷰 목록
// GET
// http://{baseUrl}/reviews/movies/:movieId
router.get("/movies/:movie_id", review_controller.get_movie_reviews);

// 3. 리뷰 쓰기
// POST
// http://{baseUrl}/reviews/movies/:movieId
// json 형태로 입력 후 저장
router.post(
  "/movies/:movie_id",
  validate_review,
  is_auth,
  review_controller.create_review
);

// 4. 리뷰 수정하기
// PATCH
// http://{baseUrl}/reviews/:idx
// json 형태로 입력 후 저장
router.put("/:idx", validate_review, is_auth, review_controller.update_review);

// 5. 리뷰 삭제하기
// DELETE
// http://{baseUrl}/reviews/:idx
router.delete("/:idx", is_auth, review_controller.delete_review);

// 6. 리뷰 추천순 정렬
// GET
// http://{baseUrl}/reviews/recommand
router.get("/recommand", review_controller.recommanded_reviews);

// 7. 리뷰 최신순 정렬
// GET
// http://{baseUrl}/reviews/latest
router.get("/latest", review_controller.latest_reviews);

// 8. 리뷰 평점순 정렬
// GET
// http://{baseUrl}/reviews/rated/:params
router.get("/rate/:updown", review_controller.rating_reviews);

export default router;
