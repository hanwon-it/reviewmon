import * as user_repository from "../data/user.mjs";
import bcrypt from "bcrypt"; // 수정: * as -> default import로
import jwt from "jsonwebtoken";
import { config } from "../config.mjs";
import { Favorite } from "../data/favorite.mjs";

const secret_key = config.jwt.secret_key;
const bcrypt_salt_rounds = config.bcrypt.salt_rounds;
const jwt_expires_in_days = config.jwt.expires_in_sec;

function create_jwt_token(id) {
  return jwt.sign({ id }, secret_key, { expiresIn: jwt_expires_in_days });
}

// ✅ 회원가입
export async function signup(req, res) {
  try {
    const { userid, password, name, email, nickname, hp, genre, actor, director } = req.body;
    console.log("[회원가입 요청]", req.body);

    const found_user = await user_repository.find_by_userid(userid);
    if (found_user) {
      return res.status(409).json({ message: `${userid} 아이디가 이미 존재합니다.` });
    }

    const hashed_pw = await bcrypt.hash(password, bcrypt_salt_rounds);

    const new_user = await user_repository.create_user({
      userid,
      password: hashed_pw,
      name,
      email,
      nickname,
      hp,
    });

    if (!new_user || !new_user._id) {
      return res.status(500).json({ message: "유저 생성 실패: _id 없음" });
    }

    // 선호조사 정보 저장 (favorite 컬렉션)
    if (genre || actor || director) {
      try {
        await Favorite.create({
          user_idx: new_user._id,
          userid: new_user.userid,
          gerne: genre || [],
          actor: actor || [],
          director: director || [],
        });
      } catch (favErr) {
        console.error("[선호조사 저장 에러]", favErr);
        // 회원가입은 성공 처리, favorite 저장 실패만 로그
      }
    }

    const token = create_jwt_token(new_user._id.toString());
    return res.status(201).json({ userid: new_user.userid, token });

  } catch (err) {
  if (err.code === 11000 && err.keyPattern?.email) {
    return res.status(409).json({ message: "이미 등록된 이메일입니다." });
  }
  console.error("[회원가입 에러]", err);
  return res.status(500).json({ message: "회원가입 처리 중 서버 오류" });
}
}

// ✅ 아이디 중복 확인
export async function check_userid(req, res) {
  try {
    const { userid } = req.body;
    if (!userid) return res.status(400).json({ message: "아이디를 입력해주세요." });

    const exists = await user_repository.find_by_userid(userid);
    res.status(200).json({ exists: !!exists });
  } catch (err) {
    console.error("check_userid error:", err);
    res.status(500).json({ message: "서버 오류로 중복 확인 실패" });
  }
}

// ✅ 로그인
export async function login(req, res) {
  try {
    const { userid, password } = req.body;
    const user = await user_repository.find_by_userid(userid);

    if (!user) {
      return res.status(401).json({ message: "존재하지 않는 아이디입니다." });
    }

    const is_valid_password = await bcrypt.compare(password, user.password);
    if (!is_valid_password) {
      return res.status(401).json({ message: "아이디 또는 비밀번호가 틀립니다." });
    }

    const token = await create_jwt_token(user._id.toString());
    console.log(token);
    res.status(200).json({ token: token, userid: user.userid });
  } catch (err) {
    console.error("로그인 오류:", err);
    res.status(500).json({ message: "로그인 처리 중 서버 오류" });
  }
}

// 사용자 조회
export async function my_info(req, res) {
  try {
    const user = await user_repository.find_by_idx(req.id);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없음" });
    }

    // 선호조사 정보 조회
    let favorite = await Favorite.findOne({ user_idx: user._id });
    // favorite이 없을 수도 있으니 null 허용

    res.status(200).json({
      userid: user.userid,
      nickname: user.nickname,
      email: user.email,
      hp: user.hp,
      createdAt: user.createdAt,
      favorite: favorite || null,
    });
  } catch (err) {
    console.error("my_info 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
}
// 로그아웃 기능

// 내 회원 정보 가져오기  이 부분 왜 있는지 모르겠음 지금까진(광주)
export async function logout(req, res, next) {
  const { userid, token } = req.body;
  //const data = await user_repository.userCheck(userid);
  //user 테이블 내 모든 값 json + review 기준 timestamp 가장 최신순 3개 json
  const user_and_review = await user_repository.load_mypage(userid);
  if (user && token !== null) {
    //req.session.destroy(() => {
    res.status(200).json(user_and_review);
    //});
  } else {
    res.status(404).json({
      message: `현재 로그인 돼 있지 않습니다.`,
    });
  }
}

// 이메일로 아이디 찾기

// 이메일로 비밀번호 찾기 (임시)
export async function find_pw_by_email(req, res) {
  res.status(501).json({ message: "아직 구현되지 않은 기능입니다." });
}

// 이메일로 아이디 찾기 (임시)
export async function find_id_by_email(req, res) {
  res.status(501).json({ message: "아직 구현되지 않은 기능입니다." });
}

// 내 회원 정보 수정
export async function update_user_info(req, res) {
  try {
    const id = req.id;
    const updates = req.body;

    if (updates.password) {
      const hashed_pw = await bcrypt.hash(updates.password, bcrypt_salt_rounds);
      updates.password = hashed_pw;
    }

    const result = await user_repository.update_user_by_id(id, updates);

    if (result.modifiedCount === 0) {
      return res
        .status(400)
        .json({ success: false, message: "변경된 내용 없음" });
    }

    res.status(200).json({ success: true, message: "업데이트 완료" });
  } catch (err) {
    console.error("업데이트 오류:", err);
    res.status(500).json({ success: false, message: "서버 내부 오류" });
  }
}

// 회원 탈퇴
export async function signout(req, res) {
  try {
    const id = req.id;
    const result = await user_repository.delete_user_by_id(id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }
    res.status(200).json({ message: "회원 탈퇴가 완료되었습니다." });
  } catch (err) {
    console.error("회원 탈퇴 오류:", err);
    res.status(500).json({ message: "서버 오류로 인해 탈퇴 실패" });
  }
}

// 내 취향 정보 입력 (임시)
export async function input_favorite(req, res) {
  res.status(501).json({ message: "아직 구현되지 않은 기능입니다." });
}

// 내 취향 정보 수정 
export async function update_favorite(req, res) {
  try {
    const user_idx = req.id; // 토큰에서 추출
    const update = {};
    if (req.body.actor) update.actor = req.body.actor;
    if (req.body.director) update.director = req.body.director;
    if (req.body.genre || req.body.gerne) update.gerne = req.body.genre || req.body.gerne;

    const result = await Favorite.findOneAndUpdate(
      { user_idx: user_idx },
      { $set: update },
      { new: true }
    );
    if (!result) {
      return res.status(404).json({ message: "선호조사 정보가 없습니다." });
    }
    res.status(200).json({ success: true, favorite: result });
  } catch (err) {
    console.error("선호조사 수정 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
}

// 닉네임 검색 (부분 일치)
export async function search_auth(req, res) {
  try {
    let { nickname } = req.params;
    console.log("닉네임 검색 요청(원본):", nickname);
    nickname = nickname.replace(/\s/g, ""); // 모든 공백 제거
    console.log("닉네임 검색 요청(공백제거):", nickname);
    if (!nickname) {
      return res.status(400).json({ message: "닉네임을 입력해주세요." });
    }
    // 부분 일치 검색 (대소문자 구분 X, DB의 nickname에서도 공백 제거)
    const users = await user_repository.find_by_nickname_regex(nickname);
    console.log("DB에서 찾은 유저:", users);
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "해당 닉네임의 유저가 없습니다." });
    }
    // 최소 정보만 반환
    const result = users.map(u => ({
      user_idx: u._id,
      nickname: u.nickname,
      profile_image_url: u.profile_image_url || null,
      userid: u.userid
    }));
    res.status(200).json(result);
  } catch (err) {
    console.error("닉네임 검색 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
}
