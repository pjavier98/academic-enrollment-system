import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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
}
