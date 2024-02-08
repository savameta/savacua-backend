import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LinkAccountMessage {
  @ApiProperty()
  @IsString()
  wallet_address: string;
}
export class LinkAccountOnChain {
  @ApiProperty()
  @IsString()
  wallet_address: string;

  @ApiProperty()
  @IsString()
  signature: string;
}
