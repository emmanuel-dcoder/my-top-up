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
import { TopupBoxService } from 'src/topupbox/topupbox.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly topupBoxService: TopupBoxService,
  ) {}

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

  /** ✅ recharge airtime for user for a specific network */
  async rechargeForUser(
    userId: string,
    network: string,
    rechargeType: 'AIRTIME' | 'DATA',
    payload: any,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new HttpException('User not found', 404);

    // Ensure payload has beneficiary as user's number if not provided
    payload.beneficiary = payload.beneficiary || user.mobileNumber;

    const response = await this.topupBoxService.recharge(
      network,
      rechargeType,
      payload,
    );
    return { user: user.mobileNumber, result: response };
  }

  /** ✅ Get data price list for a specific network */
  async getDataPackagesForNetwork(network: string) {
    if (!network) {
      throw new BadRequestException('Network is required');
    }
    return await this.topupBoxService.getDataPackages(network.toUpperCase());
  }

  /** ✅ Get all data price lists */
  async getAllDataPackages() {
    return await this.topupBoxService.getAllDataPackages();
  }
}
