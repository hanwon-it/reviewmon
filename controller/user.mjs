import * as user_repository from "../data/user.mjs";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config.mjs";

const secret_key = config.jwt.secret_key;
const bcrypt_salt_rounds = config.bcrypt.salt_rounds;
const jwt_expires_in_days = config.jwt.expires_in_sec;

async function create_jwt_token(id) {
  return jwt.sign({ id }, secret_key, { expiresIn: jwt_expires_in_days });
}

export async function signup(req, res, next) {
  const { userid, password, name, email, nickname, hp } = req.body;

  console.log(req.body);

  // id 중복 체크
  const found_userid = await user_repository.find_by_userid(userid);
  if (found_userid) {
    return res
      .status(409)
      .json({ message: `${userid} 아이디가 이미 있습니다.` });
  }

  const hashed = bcrypt.hashSync(password, bcrypt_salt_rounds);
  const users = await user_repository.create_user({
    userid,
    password: hashed,
    name,
    email,
    nickname,
    hp,
  });

  const token = await create_jwt_token(users.id);
  console.log(token);
  if (users) {
    res.status(201).json({ userid, token });
  }
}

// 아이디 중복체크(DB 입력 전 재확인 필요하므로 회원가입 검증은 수정 불요)
export async function check_userid(req, res, next) {
  const userid = req.query;
  const found_userid = await user_repository.find_by_userid(userid);
  try {
    if (found_userid !== null) {
      res.status(409).json({ exists: user });
    } else {
      res.status(200).json(`가입 가능`);
    }
  } catch {
    res.status(400).json(`실패`);
  }
}

// 로그인
export async function login(req, res, next) {
  const { userid, password } = req.body;

  console.log(req.body);

  const user = await user_repository.find_by_userid(userid);
  if (!user) {
    res.status(401).json(`${userid} 아이디를 찾을 수 없음`);
  }
  const is_valid_password = await bcrypt.compare(password, user.password);
  if (!is_valid_password) {
    return res.status(401).json({ message: "아이디 또는 비밀번호 확인 바람" });
  }

  const token = await create_jwt_token(user.id);
  res.status(200).json({ token, userid });
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
