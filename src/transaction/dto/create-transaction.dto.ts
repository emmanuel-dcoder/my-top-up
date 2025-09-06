import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsString } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({
    example: 'user@gmail.com',
    description: 'insert user email to be registered',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 700000 })
  @IsNumber()
  amount: string;

  @ApiProperty()
  @IsString()
  user: string;
}
