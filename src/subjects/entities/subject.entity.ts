import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Secretariat } from '../../secretariats/entities/secretariat.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';

export enum PreRequisiteSubjects {
  GRADUATION = 'graduation',
  POS_GRADUATION = 'pos_graduation',
}

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column()
  credits_number: number;

  @Column()
  minimum_credits_number_to_attend: number;

  @Column({ type: 'enum', enum: PreRequisiteSubjects })
  type: PreRequisiteSubjects;

  @ManyToOne(() => Secretariat, (secretariat) => secretariat.subjects)
  secretariat: Secretariat;

  @ManyToOne(() => Teacher, (teacher) => teacher.subjects)
  teacher: Teacher;
}
