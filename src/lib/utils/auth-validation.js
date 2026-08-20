const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value, messages = {}) {
  const email = value.trim();

  if (!email) {
    return messages.required || "이메일을 입력하세요.";
  }

  if (!EMAIL_PATTERN.test(email)) {
    return messages.invalid || "올바른 이메일 형식을 입력하세요.";
  }

  return "";
}

export function validatePassword(value, messages = {}) {
  if (!value) {
    return messages.required || "비밀번호를 입력하세요.";
  }

  return "";
}

export function validateNickname(value, messages = {}) {
  const nickname = value.trim();

  if (!nickname) {
    return messages.required || "닉네임을 입력하세요.";
  }

  return "";
}

export function validateRequiredTerms(checked, messages = {}) {
  if (!checked) {
    return (
      messages.required ||
      "이용약관 및 개인정보처리방침에 동의해 주세요."
    );
  }

  return "";
}
