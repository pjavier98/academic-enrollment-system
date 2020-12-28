import { EnrolledSubject } from '../../enrolled-subjects/entities/enrolled-subject.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Department } from '../../departments/entities/department.entity';

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

  @ManyToOne(() => Department, (department) => department.teachers)
  department: Department;

  @OneToMany(
    () => EnrolledSubject,
    (enrolledSubjects) => enrolledSubjects.student,
  )
  enrolledSubjects: EnrolledSubject[];
}
