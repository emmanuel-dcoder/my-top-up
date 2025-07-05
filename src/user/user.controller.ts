import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBasicAuth,
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
}
