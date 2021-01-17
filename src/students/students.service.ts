import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Department } from '../departments/entities/department.entity';
import { Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create-student.dto';
import { Student } from './entities/student.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,

    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async create(createStudentDto: CreateStudentDto) {
    const { departmentId } = createStudentDto;

    const departmentExist = await this.departmentRepository.findOne(
      departmentId,
    );

    if (!departmentExist) {
      throw new NotFoundException(`Department #${departmentId} not found`);
    }

    const student = this.studentRepository.create({
      ...createStudentDto,
      department: departmentExist,
    });

    return this.studentRepository.save(student);
  }

  async findOne(id: string) {
    const student = await this.studentRepository.findOne(id, {
      relations: ['enrolledSubjects', 'enrolledSubjects.subject'],
      select: ['name', 'enrollmentNumber'],
    });

    if (!student) {
      throw new NotFoundException(`Student #${id} not found`);
    }

    const { enrolledSubjects, ...studentData } = student;

    const parsedEnrolledSubjects = enrolledSubjects.map((enrolledSubject) => ({
      name: enrolledSubject.subject.name,
      code: enrolledSubject.subject.code,
    }));

    const parsedStudent = {
      ...studentData,
      enrolledSubjects: parsedEnrolledSubjects,
    };

    return parsedStudent;
  }
}
