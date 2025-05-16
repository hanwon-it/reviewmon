import * as user_repository from "../data/user.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config.mjs";

const secret_key = config.jwt.secret_key;
const bcrypt_salt_rounds = config.bcrypt.salt_rounds;
const jwt_expires_in_days = config.jwt.expires_in_sec;

async function create_jwt_token(id) {
  return jwt.sign({ id }, secret_key, { expiresIn: jwt_expires_in_days });
}

// 회원가입
export async function signup(req, res) {
  try {
    const { userid, password, name, email, nickname, hp } = req.body;
    console.log("[회원가입 요청]", req.body);

    const found_user = await user_repository.find_by_userid(userid);
    if (found_user) {
      return res
        .status(409)
        .json({ message: `${userid} 아이디가 이미 존재합니다.` });
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

// 회원가입 시 id 중복 체크
export async function check_userid(req, res) {
  try {
    const { userid } = req.body;
    if (!userid)
      return res.status(400).json({ message: "아이디를 입력해주세요." });

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
      return res
        .status(401)
        .json({ message: "아이디 또는 비밀번호가 틀립니다." });
    }

    const token = create_jwt_token(user._id.toString());
    res.status(200).json({ token, userid: user.userid });
  } catch (err) {
    console.error("로그인 오류:", err);
    res.status(500).json({ message: "로그인 처리 중 서버 오류" });
  }
}

/*
export async function verify(req, res, next) {
  const id = req.id;
  if (id) {
    res.status(200).json(id);
  } else {
    res.status(401).json({ message: "사용자 인증 실패" });
  }
}

// 사용자 조회
export async function me(req, res, next) {
  const user = await user_repository.find_by_id(req.id);
  if (!user) {
    return res.status(404).json({ message: "일치하는 사용자가 없음" });
  }
  res.status(200).json({ token: req.token, userid: user.userid });
}

// 로그아웃
// 토큰에 저장된 유저 정보를 삭제하는 함수
export async function logout(req, res, next) {
  const { userid, token } = req.body;
  const user = await user_repository.find_by_userid(userid);
  if (user && token !== null) {
    // 토큰 삭제 / 무효화 로직
    //req.session.destroy(() => {
    res.sendStatus(200); //.json({ message: `로그아웃 되셨습니다.` });
    //});
  } else {
    res.status(404).json({
      message: `현재 로그인 돼 있지 않습니다.`,
    });
  }
}

// 내 회원 정보 가져오기
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
export async function find_id_by_email(req, res, next) {
  const { name, email } = req.body;
  const found_userid = await user_repository.find_id_by_email(name, email);
  if (name && email !== null) {
    res.status(200).json(found_userid);
  } else {
    res.status(404); //.json({
      //message: `아름과 이메일 정보가 없습니다.`,
    //});
    
  }
}

// 이메일로 비번 찾기
export async function find_pw_by_email(req, res, next) {
  const { userid, email } = req.body;
  const found_password = await user_repository.find_pw_by_email(userid, email);
  if (userid && email !== null) {
    res.status(200).json(found_password);
  } else {
    res.status(404); //.json({
      //message: `현재 로그인 돼 있지 않습니다.`,
    //});
  }
}

// 내 회원 정보 수정
export async function update_user(req, res, next) {
  const { userid, password, name, email, nickname, hp } = req.body;
  try {
    // 유효성 검증
    if (!userid) {
      return res.status(400); //.json({ message: '입력값이 부족합니다.' });
    }

    // 업데이트(mongoose 변경)
    await db.collection("users").updateOne(
      { userid: userid },
      {
        $set: {
          ...(password && { password }),
          ...(name && { name }),
          ...(email && { email }),
          ...(nickname && { nickname }),
          ...(hp && { hp }),
        },
      },
      { upsert: true }
    );

    return res.status(200); //.json({ message: '취향 정보가 업데이트되었습니다.' });
  } catch {}
}

// 탈퇴
export async function signup(req, res, next) {
  const { userid, token } = req.body;
  const users = await user_repository.delete_user(userid);
  // console.log(token);
  if (users) {
    res.status(200);
  }
}

// 내 취향 정보 입력
export async function input_favorite(req, res, next) {
  const { genre, cast, director } = req.body;

  const users = await user_repository.create_favorite({
    genre,
    cast,
    director,
  });
  if (users) {
    res.status(201);
  }
}

// 내 취향 정보 수정
export async function update_favorite(req, res, next) {
  const userid = req.params.userid;
  const { genre, cast, director } = req.body;
  try {
    // 유효성 검증
    if (!userid || (!genre && !cast && !director)) {
      return res.status(400); //.json({ message: '입력값이 부족합니다.' });
    }

    // 업데이트(mongoose 변경)
    await db.collection("favorite").updateOne(
      { userid: parseInt(userid) },
      {
        $set: {
          ...(genre && { genre }),
          ...(cast && { cast }),
          ...(director && { director }),
        },
      },
      { upsert: true }
    );

    return res.status(200); //.json({ message: '취향 정보가 업데이트되었습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(500); //.json({ message: '서버 오류' });
  }
}

// 유저 닉네임 검색
*/
