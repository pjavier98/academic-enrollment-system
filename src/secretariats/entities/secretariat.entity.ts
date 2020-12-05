import { Department } from '../../departments/entities/department.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Subject } from '../../subjects/entities/subject.entity';

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
  department: Department;

  @OneToMany(() => Subject, (subjects) => subjects.secretariat)
  subjects: Subject[];
}
