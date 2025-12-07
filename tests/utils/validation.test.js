import { validateEmail, validatePassword, validatePasswordConfirm, validateNickname } from '../../utils/validation.js';

describe('Validation Utilities', () => {
  // validateEmail tests
  describe('validateEmail', () => {
    test('should return null for a valid email', () => {
      expect(validateEmail('test@example.com')).toBeNull();
    });

    test('should return an error message for an empty email', () => {
      expect(validateEmail('')).toBe('이메일을 입력해주세요.');
    });

    test('should return an error message for an invalid email format', () => {
      expect(validateEmail('invalid-email')).toBe('올바른 이메일 형식을 입력해주세요.');
      expect(validateEmail('test@.com')).toBe('올바른 이메일 형식을 입력해주세요.');
      expect(validateEmail('test@example')).toBe('올바른 이메일 형식을 입력해주세요.');
      expect(validateEmail('test@@@example')).toBe('올바른 이메일 형식을 입력해주세요.');
    });
  });

  // validatePassword tests
  describe('validatePassword', () => {
    test('should return null for a valid password', () => {
      expect(validatePassword('Password123!')).toBeNull();
    });

    test('should return an error message for an empty password', () => {
      expect(validatePassword('')).toBe('비밀번호를 입력해주세요.');
    });

    test('should return an error message for a password too short', () => {
      expect(validatePassword('Short1!')).toBe('비밀번호는 8자 이상, 20자 이하이어야 합니다.');
    });

    test('should return an error message for a password too long', () => {
      expect(validatePassword('ThisIsAVeryLongPassword12345!')).toBe('비밀번호는 8자 이상, 20자 이하이어야 합니다.');
    });

    test('should return an error message if missing uppercase', () => {
      expect(validatePassword('password123!')).toBe('대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.');
    });

    test('should return an error message if missing lowercase', () => {
      expect(validatePassword('PASSWORD123!')).toBe('대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.');
    });

    test('should return an error message if missing number', () => {
      expect(validatePassword('Password!!')).toBe('대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.');
    });

    test('should return an error message if missing special character', () => {
      expect(validatePassword('Password123')).toBe('대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.');
    });
  });

  // validatePasswordConfirm tests
  describe('validatePasswordConfirm', () => {
    test('should return null if passwords match', () => {
      expect(validatePasswordConfirm('Password123!', 'Password123!')).toBeNull();
    });

    test('should return an error message for an empty password confirmation', () => {
      expect(validatePasswordConfirm('Password123!', '')).toBe('비밀번호 확인을 입력해주세요.');
    });

    test('should return an error message if passwords do not match', () => {
      expect(validatePasswordConfirm('Password123!', 'Mismatch123!')).toBe('비밀번호가 일치하지 않습니다.');
    });
  });

  // validateNickname tests
  describe('validateNickname', () => {
    test('should return null for a valid nickname', () => {
      expect(validateNickname('ValidNick')).toBeNull();
    });

    test('should return an error message for an empty nickname', () => {
      expect(validateNickname('')).toBe('닉네임을 입력해주세요.');
    });

    test('should return an error message if nickname contains spaces', () => {
      expect(validateNickname('Nick Name')).toBe('띄어쓰기를 없애주세요.');
    });

    test('should return an error message if nickname is too long', () => {
      expect(validateNickname('ThisNicknameIsTooLong')).toBe('닉네임은 최대 10자까지 작성 가능합니다.');
    });
  });
});
