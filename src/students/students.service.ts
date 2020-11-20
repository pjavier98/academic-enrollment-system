import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DepartmentsService } from 'src/departments/departments.service';
import { Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './entities/student.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    private readonly departmentService: DepartmentsService,
  ) {}

  async create(createStudentDto: CreateStudentDto) {
    const departmentExist = await this.departmentService.findOne(
      createStudentDto.departmentId,
    );

    const student = this.studentRepository.create(createStudentDto);

    student.department = departmentExist;

    return this.studentRepository.save(student);
  }

  findAll() {
    return this.studentRepository.find();
  }

  async findOne(id: string) {
    const student = await this.studentRepository.findOne(id);

    if (!student) {
      throw new NotFoundException(`Student #${id} not found`);
    }

    return student;
  }

  update(id: number, updateStudentDto: UpdateStudentDto) {
    return `This action updates a #${id} student`;
  }

  remove(id: number) {
    return `This action removes a #${id} student`;
  }
}
