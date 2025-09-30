import { IsString, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RechargeEnum, RechargeTypeEnum } from '../enum/recharge.enum';

export class CreateRechargeDto {
  @ApiProperty({
    description:
      'Network the user is recharging, e.g mtn, airtel, glo or 9mobile',
    example: 'mtn',
  })
  @IsString()
  @IsNotEmpty()
  network: RechargeEnum;

  @ApiProperty({
    description: 'The type of recharge, e.g airtime OR data',
    example: 'airtime',
  })
  @IsString()
  @IsNotEmpty()
  rechargeType: RechargeTypeEnum;

  @ApiProperty({
    description: 'Intended amount to recharge',
    example: '100',
  })
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({
    description: 'Beneficiary phone number',
    example: '08137123489',
  })
  @IsString()
  @IsNotEmpty()
  beneficiary: string;
}
