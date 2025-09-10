import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { envConfig } from 'src/env.config';
import { Transaction } from 'src/transaction/schemas/transaction.schema';
import * as crypto from 'crypto';
import { TopupBoxService } from 'src/topupbox/topupbox.service';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    private topupBoxService: TopupBoxService,
  ) {}

  async getTransaction(userId: string) {
    try {
      const transaction = await this.transactionModel.find({
        userId: new mongoose.Types.ObjectId(userId),
        status: 'confirmed',
      });
      return transaction;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async handlePaystackEvent(event: any) {
    try {
      //verify transaction
      const transaction = await this.transactionModel.findOne({
        reference: event.data.reference,
      });

      if (!transaction) throw new BadRequestException('Invalid trasaction');

      if (transaction.status === 'confirmed')
        throw new BadRequestException('Likely duplicate transaction');

      if (event.event === 'charge.success') {
        transaction.status = 'confirmed';
        await transaction.save();

        const amount: string = `${transaction.amount}`;

        await this.topupBoxService.recharge(
          transaction.network,
          transaction.paymentFor,
          amount,
          transaction.beneficiary,
          transaction.customerReference,
        );
      } else {
        transaction.status = 'failed';
        await transaction.save();
      }

      return { message: 'Payment verified' };
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  verifyWebhookSignature(body: any, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', envConfig.paystack.key)
      .update(JSON.stringify(body))
      .digest('hex');

    return hash === signature;
  }
}
