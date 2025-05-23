import * as user_repository from "../data/user.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config.mjs";
import { Favorite } from "../data/favorite.mjs";
import { validationResult } from "express-validator";
import nodemailer from "nodemailer";
import { User } from "../data/user.mjs";

const secret_key = config.jwt.secret_key;
const bcrypt_salt_rounds = config.bcrypt.salt_rounds;
const jwt_expires_in_days = config.jwt.expires_in_sec;

// 파일 상단에 추가
const rateLimitMap = new Map();

// 유틸 함수: IP 추출
function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.connection.remoteAddress
  );
}

// 하루 기준 타임스탬프 초기화
function resetDailyCounts() {
  const now = Date.now();
  for (const [ip, info] of rateLimitMap.entries()) {
    if (now - info.firstRequestTime > 24 * 60 * 60 * 1000) {
      rateLimitMap.delete(ip);
    }
  }
}

// 주기적으로 리셋 (하루 1회 정도)
setInterval(resetDailyCounts, 60 * 60 * 1000); // 1시간마다 체크

function create_exp_token(id) {
  return jwt.sign({ id, is_temp_pw: true }, secret_key, { expiresIn: "6h" });
}

function create_jwt_token(id) {
  return jwt.sign({ id, is_temp_pw: false }, secret_key, {
    expiresIn: jwt_expires_in_days,
  });
}

// 회원가입
export async function signup(req, res) {
  try {
    const {
      userid,
      password,
      name,
      email,
      nickname,
      hp,
      genre,
      actor,
      director,
    } = req.body;
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

    // 선호조사 정보 저장 (favorite 컬렉션)
    if (genre || actor || director) {
      try {
        await Favorite.create({
          user_idx: new_user._id,
          userid: new_user.userid,
          genre: genre || [],
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

// ✅ 로그인
export async function login(req, res) {
  try {
    const { userid, password } = req.body;
    const user = await user_repository.find_by_userid(userid);
    if (!user) {
      console.log("[LOGIN] 존재하지 않는 아이디");
      return res.status(401).json({ message: "존재하지 않는 아이디입니다." });
    }
    const is_valid_password = await bcrypt.compare(password, user.password);
    console.log("[LOGIN] 비밀번호 일치 여부:", is_valid_password);
    if (!is_valid_password) {
      console.log("[LOGIN] 비밀번호 불일치");
      return res
        .status(401)
        .json({ message: "아이디 또는 비밀번호가 틀립니다." });
    }

    const is_temp_pw = user.is_temp_pw; // 임시비번인지 구분 방법: is_temp_pw가 true일 시
    console.log(`임시 비번 여부: ${is_temp_pw}`);

    if (is_temp_pw === true) {
      const token_exp = create_exp_token(user._id.toString());
      console.log(`[LOGIN] EXP 토큰 생성: ${token_exp}`);
      res.status(200).json({ token_exp: token_exp, userid: user.userid });
    } else {
      const token = create_jwt_token(user._id.toString());
      console.log(`[LOGIN] JWT 토큰 생성: ${token}`);
      res.status(200).json({ token: token, userid: user.userid });
    }
  } catch (err) {
    console.error("[LOGIN] 로그인 오류:", err);
    res.status(500).json({ message: "로그인 처리 중 서버 오류" });
  }
}

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

// 임시 로그인 유저 비번 변경 함수
export async function must_change_pw(req, res, next) {
  const { password } = req.body;
  const auth_header = req.headers.authorization;
  const user_idx = await token_decoding(auth_header);

  const hashed = await bcrypt.hash(password, config.bcrypt.salt_rounds);
  await user_repository.update_user_by_id(user_idx, {
    password: hashed,
  });
  await user_repository.update_user_by_id(user_idx, {
    is_temp_pw: false,
  });
  // 🔐 정상 로그인용 토큰 새로 발급
  const token = create_jwt_token(user_idx);

  // ✅ 변경 성공: 새 토큰과 함께 응답
  return res.status(200).json({
    success: true,
    token,
    userid: User.userid,
    message: "비밀번호가 성공적으로 변경되었습니다.",
  });
}



//이메일로 아이디 찾기
export async function find_id_by_email(req, res) {
  const { name, email } = req.body;
  console.log(req.body);
  try {
    const user = await user_repository.find_email(email, name);
    if (!user) {
      return res.status(404).json({ message: "일치하는 사용자가 없습니다." });
    }
    res.status(200).json({ userid: user.userid });
  } catch (err) {
    res.status(500).json({ message: "서버 오류" });
  }
}

// 이메일로 비번 찾기 (1일 3회 제한 체크 on)
export async function find_pw_by_email(req, res) {
  try {
    const ip = getClientIp(req);
    const now = Date.now();

    // IP 제한 검사
    const info = rateLimitMap.get(ip);
    if (info) {
      if (now - info.firstRequestTime < 24 * 60 * 60 * 1000) {
        if (info.count >= 10) {
          return res.status(429).json({
            success: false,
            message: "해당 IP에서의 요청 횟수가 하루 15회를 초과했습니다.",
          });
        } else {
          info.count++;
        }
      } else {
        // 하루 지났으면 초기화
        rateLimitMap.set(ip, { count: 1, firstRequestTime: now });
      }
    } else {
      rateLimitMap.set(ip, { count: 1, firstRequestTime: now });
    }
    const { email, userid } = req.body;
    const result = await user_repository.atomic_temp_pw_request_check(
      email,
      userid
    );
    if (!result.success) {
      return res.status(result.status).json({ message: result.message });
    }

    const user = result.user;

    const random_pw = generate_password(8);
    console.log(`8자리 새 비번 생성: ${random_pw}`);
    const hashed_pw = await bcrypt.hash(random_pw, config.bcrypt.salt_rounds);
    if (hashed_pw === null) {
      return res.status(500).json({
        success: false,
        message: "비밀번호 생성 실패, 비밀번호는 변경되지 않았습니다. ",
      });
    }
    const email_result = await send_pw_email(email, random_pw);
    console.log(email_result);
    if (!email_result?.success) {
      return res.status(500).json({
        success: false,
        message: "이메일 전송 실패, 비밀번호는 변경되지 않았습니다.",
      });
    }
    // 이메일 전송 성공 후 비번 갱신 시도.
    await user_repository.update_user_by_id(user._id, {
      password: hashed_pw,
    });
    console.log(`비번 갱신 성공: ${hashed_pw}`);
    // 임시 비번 여부 확인 필드 is_temp_pw를 true로 수정.
    const temp_pw_request_count = user.temp_pw_request_count + 1;
    await user_repository.update_user_by_id(user._id, {
      is_temp_pw: true,
    });
    res.status(200).json({
      success: true,
      message: `임시 비밀번호가 이메일로 전송되었습니다.(임시 비밀번호는 하루 최대 3회까지 요청 가능합니다. [${temp_pw_request_count}/3]`
    });
  } catch (err) {
    console.error("비밀번호 찾기 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
  //랜덤 비밀번호 생성
  function generate_password(length = 8) {
    const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const specials = "!@#$%^&*";
    const all = letters + numbers + specials;
    // 최소 한 글자씩 포함
    const password = [
      letters[Math.floor(Math.random() * letters.length)],
      numbers[Math.floor(Math.random() * numbers.length)],
      specials[Math.floor(Math.random() * specials.length)],
      ...Array.from(
        { length: length - 3 },
        () => all[Math.floor(Math.random() * all.length)]
      ),
    ];
    // 무작위 섞기
    return password.sort(() => Math.random() - 0.5).join("");
  }

  // 이메일 전송
  async function send_pw_email(to_email, temp_pw) {
    try {
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: config.email.user,
          pass: config.email.pass,
        },
      });
      const mailOptions = {
        from: `"Review_Mon" <${config.email.user}>`,
        to: to_email,
        subject: "임시 비밀번호 안내",
        text: `임시 비밀번호는: ${temp_pw}\n로그인 후 비밀번호를 변경해주세요.`,
      };
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (err) {
      console.error("이메일 전송 실패:", err);
      return { success: false };
    }
  }
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

// 내 취향 정보 입력 (최초 입력)
export async function input_favorite(req, res) {
  try {
    const user_idx = req.id; // 토큰에서 추출
    const { genre, actor, director } = req.body;
    // 이미 있으면 중복 입력 방지
    const exists = await Favorite.findOne({ user_idx });
    if (exists) {
      return res
        .status(400)
        .json({ message: "이미 선호조사 정보가 존재합니다." });
    }
    const favorite = await Favorite.create({
      user_idx,
      genre: genre || [],
      actor: actor || [],
      director: director || [],
    });
    res.status(201).json({ success: true, favorite });
  } catch (err) {
    console.error("선호조사 최초 입력 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
}

// 내 취향 정보 수정
export async function update_favorite(req, res) {
  try {
    const user_idx = req.id; // 토큰에서 추출
    const userid = req.body.userid;
    const update = {};
    if (req.body.actor) update.actor = req.body.actor;
    if (req.body.director) update.director = req.body.director;
    if (req.body.genre || req.body.gerne)
      update.genre = req.body.genre || req.body.gerne;

    const result = await Favorite.findOneAndUpdate(
      { user_idx: user_idx },
      { $set: { userid: userid, ...update } },
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
      return res
        .status(404)
        .json({ message: "해당 닉네임의 유저가 없습니다." });
    }
    // 최소 정보만 반환
    const result = users.map((u) => ({
      user_idx: u._id,
      nickname: u.nickname,
      profile_image_url: u.profile_image_url || null,
      userid: u.userid,
    }));
    res.status(200).json(result);
  } catch (err) {
    console.error("닉네임 검색 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
}
