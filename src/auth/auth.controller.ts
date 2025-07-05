import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  ResendVerificationOtpDto,
  VerifyAccountDto,
  VerifyOtpDto,
} from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { successResponse } from '../core/config/response';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //user login
  @Post('user/login')
  @ApiOperation({ summary: 'User Login and get JWT token' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: Object,
    example: { access_token: 'jwt.token.here' },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async userLogin(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.mobileNumber,
      loginDto.password,
    );
    const data = await this.authService.login(user);
    return successResponse({
      message: 'Login successful',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  @Post('verify-account')
  @ApiOperation({ summary: 'Verify user account with OTP' })
  @ApiBody({ type: VerifyAccountDto })
  async verifyUser(@Body() dto: VerifyAccountDto) {
    const data = await this.authService.verifyUser(dto);
    return successResponse({
      message: 'Account verified successfully',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  @Post('resend-verification-otp')
  @ApiOperation({ summary: 'Resend verification OTP to user' })
  @ApiBody({ type: ResendVerificationOtpDto })
  async resendOtp(@Body() dto: ResendVerificationOtpDto) {
    const data = await this.authService.resendVerficationOtp(dto.mobileNumber);
    return successResponse({
      message: 'OTP sent to your mobile number',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  @Post('request-password-reset')
  @ApiOperation({ summary: 'Request password reset OTP' })
  @ApiBody({ type: ForgotPasswordDto })
  async requestOtp(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const data = await this.authService.sendResetOtp(
      forgotPasswordDto.mobileNumber,
    );
    return successResponse({
      message: 'OTP sent to your mobile number',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  @Post('verify-reset-otp')
  @ApiOperation({ summary: 'Verify OTP for password reset' })
  @ApiBody({ type: VerifyOtpDto })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const data = await this.authService.verifyOtp(verifyOtpDto);
    return successResponse({
      message: 'OTP verified successfully',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change password using verified OTP' })
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    const data = await this.authService.changePassword(changePasswordDto);
    return successResponse({
      message: 'Password changed successfully',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }
}
