import {
  Controller,
  Post,
  Body,
  HttpCode,
  Headers,
  Res,
  Get,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { successResponse } from 'src/core/config/response';

@ApiTags('Transactions')
@Controller('api/v1/transaction')
export class transactionController {
  constructor(private readonly transactionService: TransactionService) {}

  /** get transaction
   */
  @Get('user')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all transaction by user' })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved',
  })
  async fetchAllTransaction(@Req() req: any) {
    const userId = req.user._id;
    const data = await this.transactionService.getTransaction(userId);
    return successResponse({
      message:
        data.length === 0 ? `No transaction found` : `Transactions retrieved`,
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

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
