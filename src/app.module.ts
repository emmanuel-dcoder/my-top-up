import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { envConfig } from './core/config/env.config';
import { UserModule } from './user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TopupBoxModule } from './topupbox/topupbox.module';
import { RechargeModule } from './recharge/recharge.module';

@Module({
  imports: [
    MongooseModule.forRoot(envConfig.database.mongo_url),
    JwtModule.register({
      secret: `${envConfig.jwt.secret}`,
      signOptions: { expiresIn: `${envConfig.jwt.expiry}` },
    }),
    AuthModule,
    UserModule,
    RechargeModule,

    TopupBoxModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
