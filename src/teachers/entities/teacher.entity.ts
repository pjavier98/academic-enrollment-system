import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Subject } from '../../subjects/entities/subject.entity';
import { Department } from '../../departments/entities/department.entity';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @ManyToOne(() => Department, (department) => department.teachers)
  department: Department;

  @OneToMany(() => Subject, (subjects) => subjects.teacher)
  subjects: Subject[];
}
