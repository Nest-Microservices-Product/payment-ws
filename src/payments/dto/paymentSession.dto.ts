import {
  ArrayMinSize,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PaymentSessionItemDto } from './paymentSessionItem.dto';
import { Type } from 'class-transformer';

export class PaymentSessionDto {
  @IsString()
  currency: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PaymentSessionItemDto)
  items: PaymentSessionItemDto[];
}
