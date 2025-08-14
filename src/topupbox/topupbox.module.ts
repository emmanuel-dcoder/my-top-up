// src/topupbox/topupbox.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TopupBoxService } from './topupbox.service';

@Module({
  imports: [
    HttpModule.register({
      baseURL:
        process.env.TOPUPBOX_API_URL || 'https://api.topupbox.com/api/v2/w1',
      timeout: 10000,
    }),
  ],
  providers: [TopupBoxService],
  exports: [TopupBoxService],
})
export class TopupBoxModule {}
