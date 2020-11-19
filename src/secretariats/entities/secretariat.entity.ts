import { Department } from 'src/departments/entities/department.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

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
