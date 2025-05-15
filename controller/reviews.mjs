import * as review_repository from "../data/reviews.mjs";
import { config } from "../config.mjs";
import mongoose from "mongoose";
import { user_schema } from "../data/users.mjs";
import { movie_schema } from "../data/movies.mjs";
import { favorite_schema } from "../data/favorite.mjs";
import { review_schema } from "../data/reviews.mjs";
import { rating_out_schema } from "../data/rating_out.mjs";

// 1. 해당 userid에 대한 리뷰를 가져오는 함수
export async function get_reviews(req, res, next) {
  const userid = req.query.userid;
  const data = await (userid
    ? review_repository.getAllByUserid(userid)
    : review_repository.getAll());
  res.status(200).json(data);
}

// 1-1. 해당 nickname에 대한 리뷰를 가져오는 함수
export async function get_reviews_by_nickname(req, res) {
  try {
    const { nickname } = req.params;

    const reviews = await reviews.find({ nickname });

    if (!reviews.length) {
      return res
        .status(404)
        .json({ message: "해당 닉네임의 리뷰가 없습니다." });
    }

    return res.status(200).json({ reviews });
  } catch (err) {
    return res.status(500).json({ message: "서버 오류", error: err.message });
  }
}

// 2. 해당 movie_id에 대한 리뷰를 가져오는 함수
export async function get_movie_reviews(req, res, next) {
  const movie_id = req.query.movie_id;
  const data = await (movie_id
    ? review_repository.getAllByUserid(userid)
    : review_repository.getAll());
  res.status(200).json(data);
}

// 3. 리뷰를 생성하는 함수
export async function create_review(req, res, next) {
  const { content, rating, nickname, movie_title } = req.body;
  const like_cnt = 0; // 좋아요 초기값 설정
  const review = await review_repository.create(
    content,
    rating,
    nickname,
    movie_title,
    like_cnt
  );
  res.status(201).json(review);
}

// 4. 리뷰를 변경하는 함수
export async function update_review(req, res, next) {
  const id = req.params.id;
  const text = req.body.text;
  const review = await review_repository.getById(id);
  if (!review) {
    return res.status(404).json({ message: `포스트가 없습니다.` });
  }
  if (review.useridx !== req.id) {
    return res.sendStatus(403);
  }
  await review_repository.remove();
  const updated = await review_repository.update(id, text);
  res.status(200).json(updated);
}

// 5. 리뷰를 삭제하는 함수
export async function delete_review(req, res, next) {
  const id = req.params.id;
  await review_repository.remove(id);
  res.sendStatus(204);
}

/* 
  review를 표시하는 함수는 API 명세서에서 1, 2번이고, 모두 review의 모든 정보를 json 배열로 전달할 예정입니다. 정렬 실행 시 js에서 해당 목록의 idx를 전달해 주는 것을 가정하고 있습니다.
  불필요해 보이는 요소는 가감이 필요할 듯합니다.
*/

// 6. 리뷰를 좋아요 숫자 순으로 정렬하는 함수
export async function recommanded_reviews(req, res, next) {
  const { idx } = req.body;
  // await review_repository.like_sort(idx)
  // 각 idx에 해당하는 리뷰에 접근, 뽑아낸 리뷰들을 like_cnt순 정렬해 json으로 idx[] 보내 주는 쿼리 포함 함수
  res.status(200);
}

// 7. 리뷰를 timestamp 순으로 정렬하는 함수
export async function latest_reviews(req, res, next) {
  const { idx } = req.body;
  // 각 idx에 해당하는 리뷰에 접근, 뽑아낸 리뷰들을 timestamp순 정렬해 json으로 idx[] 보내 주는 쿼리
  res.status(200);
}

// 8. 리뷰를 rating 순으로 정렬하는 함수
export async function rating_reviews(req, res, next) {
  // GET /api/reviews/rate/:updown?idxList=1,2,3
  try {
    const updown = req.params.updown === "true"; // 문자열 → 불리언
    const idxList = req.query.idxList?.split(",").map(Number);

    if (!Array.isArray(idxList) || idxList.some(isNaN)) {
      return res
        .status(400)
        .json({ message: "유효한 idx 배열을 제공해야 합니다." });
    }

    const reviews = await reviews.find({ idx: { $in: idxList } });

    const sorted = reviews.sort((a, b) => {
      return updown ? b.rating - a.rating : a.rating - b.rating;
    });

    return res.status(200).json({ sortedReviews: sorted });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "서버 오류 발생" });
  }
}

export async function review_sort_by_rating(req, res) {
  const { idxList, up } = req.body;
  const result = await review_repository.sort_by_rating(idxList, up);
  res.status(200).json(result);
}

export async function review_sort_by_likes(req, res) {
  const { idxList, up } = req.body;
  const result = await review_repository.sort_by_likes(idxList, up);
  res.status(200).json(result);
}

export async function review_sort_by_date(req, res) {
  const { idxList, recentFirst } = req.body;
  const result = await review_repository.sort_by_date(idxList, recentFirst);
  res.status(200).json(result);
}

// 평점을 요약해 전송하는 함수
/*
export async function reviewRatings(req, res, next) {
  const movieId = req.params.movieId;
  const ratings = await review_repository.ratings(movieId);
  res.status(200).json(ratings);
}
*/

// Swagger JSDoc
/**
 * @swagger
 * /auth/search/{nickname}:
 *   get:
 *     summary: 해당 닉네임의 리뷰 목록 조회
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: nickname
 *         required: true
 *         schema:
 *           type: string
 *         description: 조회할 유저의 닉네임 (URI 인코딩 필요)
 *         example: %EC%9D%B4%EB%AF%B8%EC%A7%80
 *     responses:
 *       200:
 *         description: 리뷰 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: 유효하지 않은 닉네임
 *       404:
 *         description: 해당 닉네임의 리뷰 없음
 *       500:
 *         description: 서버 오류
 * /api/reviews/rate/{updown}:
 *   get:
 *     summary: 리뷰 평점 정렬
 *     description: idx 배열을 받아 updown 기준으로 평점순 정렬
 *     parameters:
 *       - in: path
 *         name: updown
 *         required: true
 *         schema:
 *           type: boolean
 *         description: true → 높은 순, false → 낮은 순
 *       - in: query
 *         name: idxList
 *         required: true
 *         schema:
 *           type: string
 *           example: 1,3,7
 *         description: 쉼표(,)로 구분된 리뷰 idx 목록
 *     responses:
 *       200:
 *         description: 정렬된 리뷰 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sortedReviews:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 */
