// // :흰색_확인_표시: 3. 해당 영화 상세 정보
// export async function movie_info(req, res) {
//   try {
//     const { movie_id } = req.params.movie_id;
//     // 1. 영화 기본 정보 + 감독, 배우
//     const movie = await movie.findOne({ movie_id: movie_id }); //tmdb api 양식: https://api.themoviedb.org/3/search/person?api_key=1dc4fbac48abb39eeb4fbd6c9d845bd3&query={person}으로 교체 예정
//     if (!movie) return res.status(404).json({ message: "영화 없음" });
//     // 2. 외부 평점 정보
//     const full_rating_out = await movie_rating_out.findOne({
//       original_title: movie.original_title,
//     });
//     // 3. 통합 응답 구성
//     const full_data = {
//       ...movie.toObject(),
//       full_rating_out: full_rating_out ? full_rating_out.rating_out : null,
//     };
//     res.status(200).json(full_data);
//   } catch (err) {
//     console.error("get_full_movie_info error:", err);
//     res.status(500).json({ message: "서버 에러" });
//   }
//   // :렌치: 유틸 함수: movieid로 ObjectId 찾기
//   async function get_movie_object_id(movie_id) {
//     const movie = await movie_schema.findOne({ movie_id });
//     return movie._id;
//   }
// } // mongoose 양식으로 변환 예정 (편집됨)
