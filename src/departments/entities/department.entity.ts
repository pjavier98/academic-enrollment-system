import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Secretariat } from '../../secretariats/entities/secretariat.entity';
import { Student } from '../../students/entities/student.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @OneToMany(() => Secretariat, (secretariats) => secretariats.department)
  secretariats: Secretariat[];

  @OneToMany(() => Teacher, (teachers) => teachers.department)
  teachers: Teacher[];

  @OneToMany(() => Student, (students) => students.department)
  students: Student[];
}
