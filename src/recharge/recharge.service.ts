import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { TopupBoxService } from 'src/topupbox/topupbox.service';
import { User } from 'src/user/schemas/user.schema';
import { CreateRechargeDto } from './dto/create-recharge.dto';
import { RandomSixDigits } from 'src/core/common/util/utility';
import { Transaction } from 'src/transaction/schemas/transaction.schema';
import { PaystackService } from 'src/paystack/paystack.service';

@Injectable()
export class RechargeService {
  constructor(
    private readonly topupBoxService: TopupBoxService,
    @InjectModel(Transaction.name)
    private transactioModel: Model<Transaction>,
    private paystackService: PaystackService,
  ) {}

  async rechargeForUser(
    payload: CreateRechargeDto,
    userId: string,
    mobileNumber: string,
  ) {
    const { network, rechargeType, amount, beneficiary } = payload;

    const customerReference = `${RandomSixDigits()}TOPUPBOX${Date.now()}`;

    const paystackAmount = Number(amount);
    const initializePaystack = await this.paystackService.initiatePayment({
      amount: paystackAmount,
      email: 'anonymoususer@gmail.com',
    });

    if (!initializePaystack.data) {
      throw new BadRequestException('Error initiating payment request');
    }

    const [response] = await Promise.all([
      this.transactioModel.create({
        amount,
        reference: initializePaystack.data.reference,
        mobileNumber: mobileNumber || '',
        userId: new mongoose.Types.ObjectId(userId),
        channel: 'paystack',
        transactionId: initializePaystack.data.id || '',
        paymentFor: rechargeType,
        customerReference,
        network,
        beneficiary,
      }),
    ]);

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
