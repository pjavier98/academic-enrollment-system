import {
  Injectable,
  HttpException,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSecretariatDto } from './dto/create-secretariat.dto';
import { UpdateSecretariatDto } from './dto/update-secretariat.dto';
import { Secretariat } from './entities/secretariat.entity';
import { Department } from '../departments/entities/department.entity';

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
      {
        relations: ['secretariats'],
      },
    );

    if (!departmentExist) {
      throw new NotFoundException(`Department #${departmentId} not found`);
    }

    const existSameSecretariatType = departmentExist.secretariats.find(
      (secretariat) => secretariat.type === createSecretariatDto.type,
    );

    if (existSameSecretariatType) {
      throw new HttpException(
        'Already has a secretariat of that type for this department',
        HttpStatus.CONFLICT,
      );
    }

    const secretariat = this.secretariatRepository.create({
      ...createSecretariatDto,
      department: departmentExist,
    });

    return this.secretariatRepository.save(secretariat);
  }

  async findAll() {
    const secretariats = await this.secretariatRepository.find({
      relations: ['department', 'subjects', 'subjects.prerequisites'],
      select: ['type'],
    });

    const parsedSecretariats = secretariats.map((secretariat) => {
      const { department, subjects, type } = secretariat;

      const parsedDepartment = {
        name: department.name,
      };

      const parsedSubjects = subjects.map((subject) => ({
        name: subject.name,
        code: subject.code,
        credits_number: subject.credits_number,
        minimum_credits_number_to_attend:
          subject.minimum_credits_number_to_attend,
        prerequisites: subject.prerequisites.map((prerequisite) => ({
          name: prerequisite.name,
          code: prerequisite.code,
          credits_number: prerequisite.credits_number,
          minimum_credits_number_to_attend:
            prerequisite.minimum_credits_number_to_attend,
        })),
      }));

      return {
        type,
        department: parsedDepartment,
        subjects: parsedSubjects,
      };
    });

    return parsedSecretariats;
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
