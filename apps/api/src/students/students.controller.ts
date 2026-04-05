import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { EnrollDto } from './dto/enroll.dto';

interface AuthRequest extends Request {
  user: { id: string };
}

@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get()
  findAll(@Req() req: AuthRequest, @Query('batchId') batchId?: string) {
    return this.studentsService.findAllForTeacher(req.user.id, batchId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.studentsService.findOne(id, req.user.id);
  }

  @Post()
  create(@Body() dto: CreateStudentDto, @Req() req: AuthRequest) {
    return this.studentsService.create(req.user.id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto, @Req() req: AuthRequest) {
    return this.studentsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.studentsService.remove(id, req.user.id);
  }

  @Post(':id/enroll')
  enroll(@Param('id') id: string, @Body() dto: EnrollDto, @Req() req: AuthRequest) {
    return this.studentsService.enroll(id, req.user.id, dto.batchId);
  }

  @Delete(':id/enroll/:batchId')
  @HttpCode(HttpStatus.NO_CONTENT)
  unenroll(@Param('id') id: string, @Param('batchId') batchId: string, @Req() req: AuthRequest) {
    return this.studentsService.unenroll(id, req.user.id, batchId);
  }
}
