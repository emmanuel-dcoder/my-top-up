import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { User } from './schemas/user.schema';
import { successResponse } from '../core/config/response';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@ApiTags('User')
@Controller('api/v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Registration successful, kindly login',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() createUserDto: CreateUserDto) {
    const data = await this.userService.create(createUserDto);
    return successResponse({
      message:
        'Registration successful, Kindly provide your otp to get verified',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  @Get('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  async getProfile(@Req() req: any) {
    const data = await this.userService.getUserProfile(req.user._id);
    return successResponse({
      message: 'User profile retrieved successfully',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  /** ✅ Get all data packages */
  @Get('data-packages')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all available data packages for all networks' })
  @ApiResponse({
    status: 200,
    description: 'Data packages retrieved successfully',
  })
  async getAllDataPackages() {
    const data = await this.userService.getAllDataPackages();
    return successResponse({
      message: 'Data packages retrieved successfully',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  /** ✅ Get data packages for a specific network */
  @Get('data-packages/:network')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get data packages for a specific network' })
  @ApiResponse({
    status: 200,
    description: 'Data packages retrieved successfully',
  })
  async getDataPackagesForNetwork(@Param('network') network: string) {
    const data = await this.userService.getDataPackagesForNetwork(network);
    return successResponse({
      message: `Data packages for ${network} retrieved successfully`,
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  /** ✅ Recharge airtime/data for authenticated user */
  @Post('recharge')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Recharge airtime or data for authenticated user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        network: { type: 'string', example: 'MTN' },
        rechargeType: { type: 'string', enum: ['AIRTIME', 'DATA'] },
        payload: {
          type: 'object',
          example: { amount: 100, beneficiary: '08012345678' },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Recharge request processed successfully',
  })
  async rechargeForUser(
    @Req() req: any,
    @Body()
    body: { network: string; rechargeType: 'AIRTIME' | 'DATA'; payload: any },
  ) {
    const data = await this.userService.rechargeForUser(
      req.user._id,
      body.network,
      body.rechargeType,
      body.payload,
    );
    return successResponse({
      message: 'Recharge processed successfully',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }
}
