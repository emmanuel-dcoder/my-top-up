import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import {
  hashPassword,
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

      const hashedPassword = await hashPassword(password);

      const createdUser = await this.userModel.create({
        ...createUserDto,
        mobileNumber: mobile.phone,
        password: hashedPassword,
      });

      createdUser.password = undefined;

      return createdUser;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }
}
