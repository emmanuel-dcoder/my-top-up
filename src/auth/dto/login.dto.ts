import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'The mobile/phone number of the user',
    example: '+2347056431232',
  })
  @IsString()
  mobileNumber: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'The mobile/phone number of the user',
    example: '+2347056431232',
  })
  @IsString()
  @IsNotEmpty()
  mobileNumber: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    description: 'The mobile/phone number of the user',
    example: '+2347056431232',
  })
  @IsString()
  mobileNumber: string;

  @ApiProperty({
    description: 'six digits otp sent',
    example: '654876',
  })
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'six digits otp sent',
    example: '654876',
  })
  @IsString()
  @IsNotEmpty()
  otp: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
