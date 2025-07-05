import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  comparePassword,
  hashPassword,
  RandomSixDigits,
  sanitizePhoneNumber,
} from '../core/common/util/utility';
import { User } from '../user/schemas/user.schema';
import {
  ChangePasswordDto,
  VerifyAccountDto,
  VerifyOtpDto,
} from './dto/login.dto';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(mobileNumber: string, pass: string): Promise<any> {
    try {
      const validateNumber = sanitizePhoneNumber(mobileNumber);
      let user = await this.userModel.findOne({
        mobileNumber: validateNumber.phone,
      });

      if (!user.isVerified)
        throw new BadRequestException(
          'Unverified user, kindly verify your account',
        );

      if (!user || !(await comparePassword(pass, user.password))) {
        throw new BadRequestException('Invalid mobileNumber or password');
      }
      const { password, ...result } = user.toObject();
      return result;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async login(user: JwtPayload) {
    try {
      const payload = {
        sub: user._id,
        mobileNumber: user.mobileNumber,
      };
      return {
        _id: user._id,
        mobileNumber: user.mobileNumber,
        jwtToken: await this.jwtService.sign(payload),
      };
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async verifyUser(verifyDto: VerifyAccountDto): Promise<any> {
    try {
      const { mobileNumber, verificationOtp } = verifyDto;
      const mobile = sanitizePhoneNumber(mobileNumber);
      const user = await this.userModel.findOne({ mobileNumber: mobile.phone });
      if (
        !user ||
        user.verificationOtp !== verificationOtp ||
        (user.verificationOtpExpires &&
          new Date() > new Date(user.verificationOtpExpires))
      )
        throw new BadRequestException('Invalid or expired OTP');

      user.isVerified = true;
      user.verificationOtp = null;
      user.verificationOtpExpires = null;
      await user.save();

      return { mobileNumber: user.mobileNumber, verified: true };
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async resendVerficationOtp(mobileNumber: string): Promise<any> {
    try {
      const mobile = sanitizePhoneNumber(mobileNumber);
      const user = await this.userModel.findOne({ mobileNumber: mobile.phone });
      if (!user) throw new BadRequestException('User not found');
      if (user.isVerified)
        throw new BadRequestException('User already verified');

      let otp = RandomSixDigits();
      let check = await this.userModel.findOne({ verificationOtp: otp });
      while (check) {
        otp = RandomSixDigits();
        check = await this.userModel.findOne({ verificationOtp: otp });
      }

      user.verificationOtp = otp;
      user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      if (process.env.NODE_ENV !== 'production') {
        return { mobileNumber: mobile.phone, otp };
      }
      return { message: 'Verification OTP sent' };
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async sendResetOtp(mobileNumber: string): Promise<any> {
    try {
      const mobile = sanitizePhoneNumber(mobileNumber);

      const user = await this.userModel.findOne({ mobileNumber: mobile.phone });
      if (!user) throw new BadRequestException('User not found');

      let otp = RandomSixDigits();

      // Optional: Avoid collision (if storing in DB permanently)
      let validateOtp = await this.userModel.findOne({ resetOtp: otp });
      while (validateOtp) {
        otp = RandomSixDigits();
        validateOtp = await this.userModel.findOne({ resetOtp: otp });
      }

      user.resetOtp = otp;
      user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      // Only return OTP in development
      if (process.env.NODE_ENV !== 'production') {
        return { mobileNumber: mobile.phone, otp };
      }

      // TODO: Send OTP via SMS
      return { message: 'OTP sent to your mobile number' };
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<any> {
    try {
      const { mobileNumber, otp } = verifyOtpDto;
      const mobile = sanitizePhoneNumber(mobileNumber);

      const user = await this.userModel.findOne({ mobileNumber: mobile.phone });
      if (!user || user.resetOtp !== otp || new Date() > user.resetOtpExpires) {
        throw new BadRequestException('Invalid or expired OTP');
      }

      return { verified: true };
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async changePassword(changePasswordDto: ChangePasswordDto): Promise<any> {
    try {
      const { otp, newPassword } = changePasswordDto;

      const user = await this.userModel.findOne({ resetOtp: otp });
      if (!user || user.resetOtp !== otp)
        throw new BadRequestException('Invalid OTP or user');

      user.password = await hashPassword(newPassword);
      user.resetOtp = null;
      await user.save();

      return { mobileNumber: user.mobileNumber };
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }
}
