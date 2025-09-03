import { IsString, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RechargeEnum, RechargeTypeEnum } from '../enum/recharge.enum';

export class CreateRechargeDto {
  @ApiProperty({
    description: 'Network the user is recharging',
    example: 'mtn, airtel, glo or 9mobile',
  })
  @IsString()
  @IsNotEmpty()
  network: RechargeEnum;

  @ApiProperty({
    description: 'The type of recharge',
    example: 'AIRTIME OR DATA',
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
  @Min(11)
  beneficiary: string;
}
