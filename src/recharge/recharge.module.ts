import { Module } from '@nestjs/common';
import { TopupBoxService } from 'src/topupbox/topupbox.service';
import { HttpModule } from '@nestjs/axios';
import { RechargeService } from './recharge.service';
import { RechargeController } from './recharge.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    HttpModule,
  ],
  controllers: [RechargeController],
  providers: [RechargeService, TopupBoxService],
  exports: [RechargeService],
})
export class RechargeModule {}
