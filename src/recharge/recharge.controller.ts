import {
  Controller,
  Post,
  Body,
  HttpStatus,
  UseGuards,
  Req,
  Get,
  Param,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { successResponse } from '../core/config/response';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RechargeService } from './recharge.service';
import { CreateRechargeDto } from './dto/create-recharge.dto';

@ApiTags('Recharge')
@Controller('api/v1/recharge')
export class RechargeController {
  constructor(
    // private readonly userService: UserService,
    private readonly rechargeService: RechargeService,
  ) {}

  /** ✅ Recharge airtime/data for authenticated user */
  @Post('recharge')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Recharge airtime or data for authenticated user' })
  @ApiBody({ type: CreateRechargeDto })
  @ApiResponse({
    status: 201,
    description: 'Recharge request processed successfully',
  })
  async rechargeForUser(
    @Req() req: any,
    @Body()
    body: CreateRechargeDto,
  ) {
    const userId = req.user._id;
    const mobileNumber = req.user.mobileNumber;
    const data = await this.rechargeService.rechargeForUser(
      {
        ...body,
      },
      userId,
      mobileNumber,
    );
    return successResponse({
      message: 'Recharge processed successfully',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  /** ✅ Get data packages for a specific network */
  @Get('data-packages/:network')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get data packages for a specific network' })
  @ApiResponse({
    status: 200,
    description: 'Data packages retrieved successfully',
  })
  async getDataPackagesForNetwork(@Param('network') network: string) {
    const data = await this.rechargeService.getDataPackagesForNetwork(network);
    return successResponse({
      message: `Data packages for ${network} retrieved successfully`,
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  /** ✅ Get all data packages */
  @Get('data-packages')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all available data packages for all networks' })
  @ApiResponse({
    status: 200,
    description: 'Data packages retrieved successfully',
  })
  async getAllDataPackages() {
    const data = await this.rechargeService.getAllDataPackages();
    return successResponse({
      message: 'Data packages retrieved successfully',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }
}
