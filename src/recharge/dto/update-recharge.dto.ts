import { PartialType } from '@nestjs/swagger';
import { CreateRechargeDto } from './create-recharge.dto';

export class UpdateRechargeDto extends PartialType(CreateRechargeDto) {}
