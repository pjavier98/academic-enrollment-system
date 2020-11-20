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

  @OneToMany(() => Secretariat, (secretariat) => secretariat.departments)
  secretariats: Secretariat[];

  @OneToMany(() => Teacher, (teachers) => teachers.departament)
  teachers: Teacher[];

  @OneToMany(() => Student, (students) => students.departaments)
  students: Student[];
}
