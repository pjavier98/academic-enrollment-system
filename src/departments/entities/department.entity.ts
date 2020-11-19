import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Secretariat } from '../../secretariats/entities/secretariat.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @OneToMany(() => Secretariat, (secretariat) => secretariat.departments)
  secretariats: Secretariat[];

  @OneToMany(() => Teacher, (teachers) => teachers.departaments)
  teachers: Teacher[];
}
