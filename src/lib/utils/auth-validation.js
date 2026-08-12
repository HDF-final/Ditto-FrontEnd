const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value) {
  const email = value.trim();

  if (!email) {
    return "이메일을 입력하세요.";
  }

  if (!EMAIL_PATTERN.test(email)) {
    return "올바른 이메일 형식을 입력하세요.";
  }

  return "";
}

export function validatePassword(value) {
  if (!value) {
    return "비밀번호를 입력하세요.";
  }

  return "";
}

export function validateNickname(value) {
  const nickname = value.trim();

  if (!nickname) {
    return "닉네임을 입력하세요.";
  }

  return "";
}

export function validateRequiredTerms(checked) {
  if (!checked) {
    return "이용약관 및 개인정보처리방침에 동의해 주세요.";
  }

  return "";
}
