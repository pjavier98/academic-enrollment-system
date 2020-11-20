import { Department } from 'src/departments/entities/department.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @ManyToOne(() => Department, (department) => department.teachers)
  department: Department;
}
