import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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
}
