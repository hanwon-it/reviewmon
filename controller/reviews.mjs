import * as review_repository from "../data/review.mjs";
import * as user_repository from "../data/user.mjs";
import * as movie_repository from "../data/movie.mjs";
import jwt from "jsonwebtoken";
import { config } from "../config.mjs";
import { Review } from "../data/review.mjs";

const secret_key = config.jwt.secret_key;

// 1. 해당 nickname에 대한 리뷰를 가져오는 함수
export async function get_reviews(req, res) {
  try {
    const { nickname } = req.query; // 또는 req.params.nickname

    if (!nickname) {
      return res.status(400).json({ error: "nickname is required" });
    }

    const reviews = await Review.find({ nickname }).sort({ createdAt: -1 });

    const user_map = {};
    for (const review of reviews) {
      const { user_idx } = review;
      if (!user_map[user_idx]) {
        user_map[user_idx] = {
          user_idx,
          nickname,
          review_count: 0,
          reviews: [],
        };
      }
      user_map[user_idx].reviews.push(review);
      user_map[user_idx].review_count++;
    }

    return res.json(Object.values(user_map));
  } catch (error) {
    console.error("Error getting reviews:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// 2. 해당 movie_id에 대한 리뷰를 가져오는 함수
export async function get_movie_reviews(req, res, next) {
  const movie_id = req.params;
  const data = await (movie_id
    ? review_repository.getAllByUserid(userid)
    : review_repository.getAll());
  res.status(200).json(data);
}

// 3. 리뷰를 생성하는 함수
export async function create_review(req, res, next) {
  try {
    const { content, rating } = req.body;
    const { movie_id } = req.params;

    // 토큰 파싱
    const auth_header = req.headers.authorization;
    const { user_idx } = await token_decoding(auth_header);

    const nickname = await user_repository.find_by_sth(user_idx, "nickname");
    console.log(nickname);
    const movie_title = await movie_repository.get_title_by_id(movie_id);
    console.log(movie_title);

    const like_cnt = 0; // 좋아요 초기값 설정
    const review = await review_repository.post_review({
      content, //FE
      rating, //FE
      nickname,
      movie_title,
      user_idx,
      movie_id,
      like_cnt,
    });
    res.status(201).json(review); //review._id
  } catch (error) {
    console.error("리뷰 생성 오류:", error);
    res.status(500).json({ message: "서버 오류로 인해 리뷰 생성 실패" });
  }
}

// 4. 리뷰를 변경하는 함수
export async function update_review(req, res, next) {
  try {
    const { idx } = req.params;
    const { content, rating } = req.body;

    // 1. 토큰 파싱
    const auth_header = req.headers.authorization;
    const { user_idx } = await token_decoding(auth_header);

    // 2. 리뷰 존재 확인
    const review = await Review.findById(idx);
    if (!review) {
      return res.status(404).json({ message: "리뷰를 찾을 수 없습니다." });
    }

    // 3. 사용자 일치 여부 확인
    if (review.user_idx !== user_idx) {
      return res.status(403).json({ message: "수정 권한이 없습니다." });
    }

    // 4. 리뷰 내용 업데이트
    review.content = content;
    review.rating = rating;
    const updated_review = await review.save();

    res
      .status(200)
      .json({ message: "리뷰가 수정되었습니다.", review: updated_review });
  } catch (error) {
    console.error("리뷰 수정 오류:", error);
    res.status(500).json({ message: "서버 오류로 인해 리뷰 수정 실패" });
  }
}

// 5. 리뷰를 삭제하는 함수
export async function delete_review(req, res, next) {
  try {
    const { idx } = req.params;
    const auth_header = req.headers.authorization;

    // 1. 토큰 파싱
    const { user_idx } = await token_decoding(auth_header);

    // 2. 리뷰 존재 확인
    const review = await Review.findById(idx);
    if (!review) {
      return res.status(404).json({ message: "리뷰를 찾을 수 없습니다." });
    }

    // 3. 작성자 확인
    if (review.user_idx !== user_idx) {
      return res.status(403).json({ message: "삭제 권한이 없습니다." });
    }

    // 4. 삭제 수행
    await Review.findByIdAndDelete(idx);
    res.status(200).json({ message: "리뷰가 삭제되었습니다." });
  } catch (error) {
    console.error("리뷰 삭제 오류:", error);
    res.status(500).json({ message: "서버 오류로 인해 리뷰 삭제 실패" });
  }
}

// 6. 리뷰를 좋아요 숫자 순으로 정렬하는 함수
export async function recommanded_reviews(req, res, next) {
  const { idx } = req.body;
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
  const result = await review_repository.sortByRating(idxList, up);
  res.status(200).json(result);
}

export async function review_sort_by_likes(req, res) {
  const { idxList, up } = req.body;
  const result = await review_repository.sortByLikes(idxList, up);
  res.status(200).json(result);
}

export async function review_sort_by_date(req, res) {
  const { idxList, recentFirst } = req.body;
  const result = await review_repository.sortByDate(idxList, recentFirst);
  res.status(200).json(result);
}

//9. 리뷰 컬렉션에서 닉네임을 키워드로 검색
export async function review_search_nickname(req, res) {
  const { keyword } = req.query;
  if (!keyword)
    return res.status(400).json({
      message: "검색어 누락",
    });
  const result = await review_repository.get_posts_by_nickname(keyword);
  res.status(200).json(result);
}

//10. 리뷰 컬렉션에서 idx를 검색
export async function get_reviews_by_user_idx(req, res) {
  const { user_idx } = req.query;

  if (!user_idx) {
    return res.status(400).json({ message: "user_idx가 없습니다." });
  }

  try {
    const results = await review_repository.get_posts_by_idx({ user_idx }); // ✅ await 추가
    res.status(200).json(results);
  } catch (err) {
    console.error("리뷰 조회 실패:", err);
    res.status(500).json({ message: "리뷰 조회 중 오류" });
  }
}

// 평점을 요약해 전송하는 함수
/*
export async function reviewRatings(req, res, next) {
  const movieId = req.params.movieId;
  const ratings = await review_repository.ratings(movieId);
  res.status(200).json(ratings);
}
*/

// 토큰 > decoded.id(user_idx) 함수
export async function token_decoding(auth_header) {
  //const auth_header = req.headers.authorization;
  if (!auth_header || !auth_header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "토큰 없음 또는 잘못된 형식" });
  }

  const token = auth_header.split(" ")[1];
  const decoded = jwt.verify(token, secret_key);
  const user_idx_from_token = decoded.id;
  return user_idx_from_token;
}
