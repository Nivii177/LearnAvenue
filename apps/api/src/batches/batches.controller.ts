import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BatchesService } from './batches.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';

interface AuthRequest extends Request {
  user: { id: string };
}

@UseGuards(JwtAuthGuard)
@Controller('batches')
export class BatchesController {
  constructor(private batchesService: BatchesService) {}

  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.batchesService.findAllForTeacher(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.batchesService.findOne(id, req.user.id);
  }

  @Post()
  create(@Body() dto: CreateBatchDto, @Req() req: AuthRequest) {
    return this.batchesService.create(req.user.id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBatchDto, @Req() req: AuthRequest) {
    return this.batchesService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.batchesService.remove(id, req.user.id);
  }
}
