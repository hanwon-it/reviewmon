import { validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  console.log('[VALIDATOR] 에러:', errors.array());
  return res.status(400).json({ message: errors.array()[0].msg });
};

export function sanitize_nickname(req, res, next) {
  const nickname = decodeURIComponent(
    req.params.nickname || req.body.nickname || ""
  );

  // 허용 문자 정규식 (한글, 영문, 숫자, 언더스코어만 허용, 2~20자)
  const allowed_pattern = /^[a-zA-Z0-9가-힣_]{2,20}$/;

  // SQL 및 위험 문자 필터링
  const forbidden_words = [
    "select",
    "insert",
    "update",
    "delete",
    "drop",
    "alter",
    "exec",
    "union",
    "--",
    ";",
    "'",
    '"',
    "`",
    "\\",
    "/*",
    "*/",
    "$ne",
    "$where",
  ];

  const lower = nickname.toLowerCase();
  const contains_forbidden = forbidden_words.some((w) => lower.includes(w));

  if (!allowed_pattern.test(nickname) || contains_forbidden) {
    return res.status(400).json({ message: "유효하지 않은 닉네임입니다." });
  }
  next();
}
