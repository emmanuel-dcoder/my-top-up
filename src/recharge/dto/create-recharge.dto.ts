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
    description: 'The type of recharge, e.g AIRTIME OR DATA',
    example: 'DATA',
  })
  @IsString()
  @IsNotEmpty()
  rechargeType: RechargeTypeEnum;

  @ApiProperty({
    description: 'Intended amount to recharge',
    example: '2000',
  })
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({
    description: 'Beneficiary phone number',
    example: '0908765368',
  })
  @IsString()
  @IsNotEmpty()
  beneficiary: string;
}
