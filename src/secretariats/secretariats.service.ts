import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSecretariatDto } from './dto/create-secretariat.dto';
import { UpdateSecretariatDto } from './dto/update-secretariat.dto';
import { Secretariat } from './entities/secretariat.entity';

@Injectable()
export class SecretariatsService {
  constructor(
    @InjectRepository(Secretariat)
    private readonly secretariatRepository: Repository<Secretariat>,
  ) {}

  create(createSecretariatDto: CreateSecretariatDto) {
    return 'This action adds a new secretariat';
  }

  async findAll() {
    const secretariats = await this.secretariatRepository.find({
      relations: ['departments'],
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
