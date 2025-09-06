import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { transactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { UserService } from 'src/user/user.service';
import { TopupBoxService } from 'src/topupbox/topupbox.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [transactionController],
  providers: [TransactionService, UserService, TopupBoxService],
  exports: [TransactionService],
})
export class TransactionModule {}
