import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TopupBoxService } from 'src/topupbox/topupbox.service';
import { User } from 'src/user/schemas/user.schema';
import { CreateRechargeDto } from './dto/create-recharge.dto';
import { RandomSixDigits } from 'src/core/common/util/utility';

@Injectable()
export class RechargeService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly topupBoxService: TopupBoxService,
  ) {}

  async rechargeForUser(payload: CreateRechargeDto, userId: string) {
    const { network, rechargeType, amount, beneficiary } = payload;

    const customerReference = `${RandomSixDigits()}TOPUPBOX${Date.now()}`;
    const response = await this.topupBoxService.recharge(
      network,
      rechargeType,
      amount,
      beneficiary,
      customerReference,
    );
    return { result: response };
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
