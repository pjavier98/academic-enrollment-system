import { Secretariat } from 'src/secretariats/entities/secretariat.entity';
import { Student } from 'src/students/entities/student.entity';
import { Teacher } from 'src/teachers/entities/teacher.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @OneToMany(() => Secretariat, (secretariat) => secretariat.department)
  secretariats: Secretariat[];

  @OneToMany(() => Teacher, (teachers) => teachers.department)
  teachers: Teacher[];

  @OneToMany(() => Student, (students) => students.department)
  students: Student[];
}
