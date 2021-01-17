import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { EnrolledSubjectsService } from './enrolled-subjects.service';
import { CreateEnrolledSubjectDto } from './dto/create-enrolled-subject.dto';
import { UpdateEnrolledSubjectDto } from './dto/update-enrolled-subject.dto';
import { UpdateEnrolledSubjectGradeDto } from './dto/update-enrolled-subject-grade.dto';

@Controller('enrolled-subjects')
export class EnrolledSubjectsController {
  constructor(
    private readonly enrolledSubjectsService: EnrolledSubjectsService,
  ) {}

  @Post()
  create(@Body() createEnrolledSubjectDto: CreateEnrolledSubjectDto) {
    return this.enrolledSubjectsService.create(createEnrolledSubjectDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enrolledSubjectsService.findOne(id);
  }

  @Put(':id/update-grade')
  updateGrade(
    @Param('id') id: string,
    @Body() updateEnrolledSubjectGradeDto: UpdateEnrolledSubjectGradeDto,
  ) {
    return this.enrolledSubjectsService.updateGrade(
      id,
      updateEnrolledSubjectGradeDto,
    );
  }
}
