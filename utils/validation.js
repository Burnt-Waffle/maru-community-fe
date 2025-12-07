export function validateEmail(email) {
    if(!email) return '이메일을 입력해주세요.';

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        return '올바른 이메일 형식을 입력해주세요.';
    }
    return null;
}

export function validatePassword(password) {
    if(!password) return '비밀번호를 입력해주세요.';

    if (password.length < 8 || password.length > 20) {
        return '비밀번호는 8자 이상, 20자 이하이어야 합니다.';
    }

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).*$/;
    if (!passwordPattern.test(password)) {
        return '대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.';
    }
    return null;
}

export function validatePasswordConfirm(password, passwordConfirm) {
    if (!passwordConfirm) return "비밀번호 확인을 입력해주세요.";

    if (password !== passwordConfirm) {
        return '비밀번호가 일치하지 않습니다.';
    }
    return null;
}

export function validateNickname(nickname) {
    if (!nickname) {
        return '닉네임을 입력해주세요.';
    }
    if (/\s/.test(nickname)) {
        return '띄어쓰기를 없애주세요.';
    }
    // 한글, 영문, 숫자만 허용하는 정규식
    const nicknamePattern = /^[가-힣a-zA-Z0-9]*$/;
    if (!nicknamePattern.test(nickname)) {
        return '닉네임은 한글, 영문, 숫자만 입력 가능합니다. (특수문자 불가)';
    }
    if (nickname.length >10) {
        return '닉네임은 최대 10자까지 작성 가능합니다.';
    }
    if (nickname.length < 2) {
        return '닉네임은 최소 2자 이상 입력해야 합니다.';
    }
    return null;
}