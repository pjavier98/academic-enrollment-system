import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { Secretariat } from '../secretariats/entities/secretariat.entity';
import { Subject } from './entities/subject.entity';
import { Teacher } from '../teachers/entities/teacher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subject, Secretariat, Teacher])],
  controllers: [SubjectsController],
  providers: [SubjectsService],
})
export class SubjectsModule {}
