import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Department } from './entities/department.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  create(createDepartmentDto: CreateDepartmentDto) {
    const department = this.departmentRepository.create(createDepartmentDto);

    return this.departmentRepository.save(department);
  }

  async findAll() {
    const departments = await this.departmentRepository.find({
      relations: ['secretariats', 'teachers', 'students'],
    });

    return departments;
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

  update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    return `This action updates a #${id} department`;
  }

  remove(id: number) {
    return `This action removes a #${id} department`;
  }
}
