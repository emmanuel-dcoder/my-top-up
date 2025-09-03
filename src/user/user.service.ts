import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import {
  hashPassword,
  RandomSixDigits,
  sanitizePhoneNumber,
} from 'src/core/common/util/utility';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { password, mobileNumber } = createUserDto;
      const mobile = sanitizePhoneNumber(mobileNumber);
      const validatePhone = await this.userModel.findOne({
        mobileNumber: mobile.phone,
      });
      if (validatePhone)
        throw new BadRequestException('Mobile number already exist');

      let otp = RandomSixDigits();

      const hashedPassword = await hashPassword(password);
      const createdUser = await this.userModel.create({
        ...createUserDto,
        mobileNumber: mobile.phone,
        password: hashedPassword,
        verificationOtp: otp,
        verificationOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
      });

      /**send verification otp to provided mobile number */

      createdUser.password = undefined;
      return createdUser;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  /**fetching user profile */
  async getUserProfile(userId: string): Promise<User> {
    try {
      const user = await this.userModel
        .findOne({ _id: new mongoose.Types.ObjectId(userId) })
        .select('-password');

      if (!user) throw new BadRequestException('User not found');
      return user;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }
}
