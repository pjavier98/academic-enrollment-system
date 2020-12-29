import { EnrolledSubject } from '../../enrolled-subjects/entities/enrolled-subject.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Department } from '../../departments/entities/department.entity';

export enum StudentType {
  GRADUATION = 'graduation',
  POS_GRADUATION = 'pos_graduation',
}

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  enrollmentNumber: string;

  @Column({ type: 'enum', enum: StudentType })
  type: StudentType;

  @ManyToOne(() => Department, (department) => department.teachers)
  department: Department;

  @OneToMany(
    () => EnrolledSubject,
    (enrolledSubjects) => enrolledSubjects.student,
  )
  enrolledSubjects: EnrolledSubject[];
}
