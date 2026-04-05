import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TeachersModule } from './teachers/teachers.module';
import { BatchesModule } from './batches/batches.module';
import { StudentsModule } from './students/students.module';
import { FeeModule } from './fee/fee.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TeachersModule,
    BatchesModule,
    StudentsModule,
    FeeModule,
  ],
})
export class AppModule {}
