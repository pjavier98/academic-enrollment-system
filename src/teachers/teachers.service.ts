import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Department } from '../departments/entities/department.entity';
import { Repository } from 'typeorm';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { Teacher } from './entities/teacher.entity';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,

    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) {}

  async create(createTeacherDto: CreateTeacherDto) {
    const { departmentId } = createTeacherDto;

    const departmentExist = await this.departmentRepository.findOne(
      departmentId,
    );

    if (!departmentExist) {
      throw new NotFoundException(`Department #${departmentId} not found`);
    }

    const teacher = this.teacherRepository.create({
      ...createTeacherDto,
      department: departmentExist,
    });

    return this.teacherRepository.save(teacher);
  }

  async findOne(id: string) {
    const teacher = await this.teacherRepository.findOne(id);

    if (!teacher) {
      throw new NotFoundException(`Teacher #${id} not found`);
    }

    return teacher;
  }
}
