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
import { ChangePasswordDto, VerifyOtpDto } from './dto/login.dto';

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

  async login(user: { _id: string; mobileNumber: string }) {
    try {
      const payload = {
        _id: user._id,
        mobileNumber: user.mobileNumber,
      };
      return {
        _id: user._id,
        email: user.mobileNumber,
        jwtToken: this.jwtService.sign(payload),
      };
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
      if (!user || user.resetOtp !== otp)
        throw new BadRequestException('Invalid OTP');

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
