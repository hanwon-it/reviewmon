import * as review_repository from "../data/reviews.mjs";

// 1. 해당 userid에 대한 리뷰를 가져오는 함수
export async function get_reviews(req, res, next) {
  const userid = req.query.userid;
  const data = await (userid
    ? review_repository.getAllByUserid(userid)
    : review_repository.getAll());
  res.status(200).json(data);
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
  const { text } = req.body;
  const reviews = await review_repository.create(text, req.id);
  res.status(201).json(reviews);
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
  const updown = req.params.updown;
  const { idx } = req.body;
  const rated_review = await review_repository.rating_sort(updown, idx);
  res.status(200).json(rated_review);
}

// 평점을 요약해 전송하는 함수
/*
export async function reviewRatings(req, res, next) {
  const movieId = req.params.movieId;
  const ratings = await review_repository.ratings(movieId);
  res.status(200).json(ratings);
}
*/
