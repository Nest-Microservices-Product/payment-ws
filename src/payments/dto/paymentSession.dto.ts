import {
  ArrayMinSize,
  IsArray,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { PaymentSessionItemDto } from './paymentSessionItem.dto';
import { Type } from 'class-transformer';

export class PaymentSessionDto {
  @IsUUID()
  orderId: string;

  @IsString()
  currency: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PaymentSessionItemDto)
  items: PaymentSessionItemDto[];
}
