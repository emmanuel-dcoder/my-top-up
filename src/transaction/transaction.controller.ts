import { Controller, Post, Body, HttpCode, Headers, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { Response } from 'express';

@ApiTags('Transactions')
@Controller('api/v1/transaction')
export class transactionController {
  constructor(private readonly transactionService: TransactionService) {}

  //wehhook for payment
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Body() body: any,
    @Headers('x-paystack-signature') signature: string,
    @Res() res: Response,
  ) {
    const isValid = this.transactionService.verifyWebhookSignature(
      body,
      signature,
    );
    if (isValid) {
      await this.transactionService.handlePaystackEvent(body);
    }
    return res.sendStatus(200);
  }
}
