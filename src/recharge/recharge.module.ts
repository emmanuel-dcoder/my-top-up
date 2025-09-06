import { Module } from '@nestjs/common';
import { TopupBoxService } from 'src/topupbox/topupbox.service';
import { HttpModule } from '@nestjs/axios';
import { RechargeService } from './recharge.service';
import { RechargeController } from './recharge.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import {
  Transaction,
  TransactionSchema,
} from 'src/transaction/schemas/transaction.schema';
import { PaystackService } from 'src/paystack/paystack.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    HttpModule,
  ],
  controllers: [RechargeController],
  providers: [RechargeService, TopupBoxService, PaystackService],
  exports: [RechargeService],
})
export class RechargeModule {}
