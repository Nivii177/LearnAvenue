import { Module } from '@nestjs/common';
import { FeeService } from './fee.service';
import { FeeController } from './fee.controller';
import { SmsService } from './sms.service';

@Module({
  providers: [FeeService, SmsService],
  controllers: [FeeController],
})
export class FeeModule {}
