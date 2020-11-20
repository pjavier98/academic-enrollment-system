import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSecretariatDto } from './dto/create-secretariat.dto';
import { UpdateSecretariatDto } from './dto/update-secretariat.dto';
import { Secretariat } from './entities/secretariat.entity';
import { Department } from 'src/departments/entities/department.entity';

@Injectable()
export class SecretariatsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,

    @InjectRepository(Secretariat)
    private readonly secretariatRepository: Repository<Secretariat>,
  ) {}

  async create(createSecretariatDto: CreateSecretariatDto) {
    const { departmentId } = createSecretariatDto;

    const departmentExist = await this.departmentRepository.findOne(
      departmentId,
    );

    if (!departmentExist) {
      throw new NotFoundException(`Department #${departmentId} not found`);
    }

    const secretariat = this.secretariatRepository.create(createSecretariatDto);
    secretariat.department = departmentExist;
    return this.secretariatRepository.save(secretariat);
  }

  async findAll() {
    const secretariats = await this.secretariatRepository.find({
      relations: ['department'],
    });

    return secretariats;
  }

  findOne(id: number) {
    return `This action returns a #${id} secretariat`;
  }

  update(id: number, updateSecretariatDto: UpdateSecretariatDto) {
    return `This action updates a #${id} secretariat`;
  }

  remove(id: number) {
    return `This action removes a #${id} secretariat`;
  }
}
