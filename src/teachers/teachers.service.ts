import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DepartmentsService } from 'src/departments/departments.service';
import { Repository } from 'typeorm';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Teacher } from './entities/teacher.entity';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,

    private readonly departmentService: DepartmentsService,
  ) {}

  async create(createTeacherDto: CreateTeacherDto) {
    const departmentExist = await this.departmentService.findOne(
      createTeacherDto.departmentId,
    );

    const teacher = this.teacherRepository.create(createTeacherDto);

    teacher.department = departmentExist;

    return this.teacherRepository.save(teacher);
  }

  findAll() {
    return this.teacherRepository.find();
  }

  async findOne(id: string) {
    const teacher = await this.teacherRepository.findOne(id);

    if (!teacher) {
      throw new NotFoundException(`Teacher #${id} not found`);
    }

    return teacher;
  }

  update(id: number, updateTeacherDto: UpdateTeacherDto) {
    return `This action updates a #${id} teacher`;
  }

  remove(id: number) {
    return `This action removes a #${id} teacher`;
  }
}
