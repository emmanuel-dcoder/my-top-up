import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

export const RandomSixDigits = (): string => {
  let result = '';
  for (let i = 0; i < 6; i++) {
    const randomNum = Math.floor(Math.random() * 10);
    result += randomNum;
  }

  if (result[0] === '0') {
    result = '1' + result.slice(1);
  }

  return result;
};

export const AlphaNumeric = (
  length: number,
  type: string = 'alpha',
): string => {
  var result: string = '';
  var characters: string =
    type === 'alpha'
      ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      : '0123456789';

  var charactersLength: number = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const verifyPhoneNumber = (phone) => {
  return /^([0]{1}|\+?234)([7-9]{1})([0|1]{1})([\d]{1})([\d]{7})$/g.test(phone);
};

export const sanitizePhoneNumber = (phone: string) => {
  const COUNTRY_CODE = '234';
  if (!verifyPhoneNumber)
    throw new BadRequestException('Phone number is invalid');

  if (phone.startsWith('0') || phone.startsWith('+')) {
    phone = phone.substring(1);
  }
  if (phone.startsWith(COUNTRY_CODE)) {
    return {
      phone: '+' + phone,
    };
  }
  return {
    phone: `+${COUNTRY_CODE}${phone}`,
  };
};
