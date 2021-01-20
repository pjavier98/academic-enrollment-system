import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { Department } from './entities/department.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    const { name } = createDepartmentDto;

    const departmentExist = await this.departmentRepository.findOne({
      where: {
        name,
      },
    });

    if (departmentExist) {
      throw new HttpException(
        'Already exist a department with the same name',
        HttpStatus.CONFLICT,
      );
    }

    const department = this.departmentRepository.create(createDepartmentDto);

    return this.departmentRepository.save(department);
  }

  async findOne(id: string) {
    const department = await this.departmentRepository.findOne(id, {
      relations: ['secretariats', 'teachers', 'students'],
    });

    if (!department) {
      throw new NotFoundException(`Department #${id} not found`);
    }

    return department;
  }
}
