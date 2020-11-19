import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Department } from '../../departments/entities/department.entity';

export enum SecretariatType {
  GRADUATION = 'graduation',
  POS_GRADUATION = 'pos_graduation',
}

@Entity('secretariats')
export class Secretariat {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'enum', enum: SecretariatType })
  type: SecretariatType;

  @ManyToOne(() => Department, (department) => department.secretariats)
  departments: Department[];
}
