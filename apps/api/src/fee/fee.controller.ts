import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeeService } from './fee.service';
import { MarkPaidDto } from './dto/mark-paid.dto';

interface AuthRequest extends Request {
  user: { id: string };
}

@UseGuards(JwtAuthGuard)
@Controller('fees')
export class FeeController {
  constructor(private feeService: FeeService) {}

  /**
   * GET /fees?batchId=xxx&month=2025-04
   * Full ledger for a batch in a given month.
   */
  @Get()
  getLedger(
    @Req() req: AuthRequest,
    @Query('batchId') batchId: string,
    @Query('month') month: string,
  ) {
    return this.feeService.getLedger(req.user.id, batchId, month);
  }

  /**
   * GET /fees/overdue
   * All overdue records for the current month across all batches.
   */
  @Get('overdue')
  getOverdue(@Req() req: AuthRequest) {
    return this.feeService.getOverdue(req.user.id);
  }

  /**
   * POST /fees/generate?batchId=xxx  (batchId optional — generates for all)
   * Create FeeRecord rows for the current month. Idempotent.
   */
  @Post('generate')
  @HttpCode(HttpStatus.OK)
  generate(@Req() req: AuthRequest, @Query('batchId') batchId?: string) {
    return this.feeService.generateForCurrentMonth(req.user.id, batchId);
  }

  /**
   * POST /fees/:id/pay
   * Mark a fee record as paid.
   */
  @Post(':id/pay')
  markPaid(@Param('id') id: string, @Body() dto: MarkPaidDto, @Req() req: AuthRequest) {
    return this.feeService.markPaid(id, req.user.id, dto);
  }

  /**
   * POST /fees/:id/remind
   * Send an SMS reminder for an overdue fee record.
   */
  @Post(':id/remind')
  @HttpCode(HttpStatus.OK)
  sendReminder(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.feeService.sendReminder(id, req.user.id);
  }
}
