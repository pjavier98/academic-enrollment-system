import { EnrolledSubject } from '../../enrolled-subjects/entities/enrolled-subject.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Secretariat } from '../../secretariats/entities/secretariat.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column()
  credits_number: number;

  @Column()
  minimum_credits_number_to_attend: number;

  @ManyToOne(() => Secretariat, (secretariat) => secretariat.subjects)
  secretariat: Secretariat;

  @ManyToOne(() => Teacher, (teacher) => teacher.subjects)
  teacher: Teacher;

  @OneToMany(
    () => EnrolledSubject,
    (enrolledSubject) => enrolledSubject.subject,
  )
  enrolledSubjects: EnrolledSubject[];

  @ManyToMany(() => Subject, (subject) => subject.prerequisites, {
    nullable: true,
    cascade: ['insert', 'update'],
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinTable()
  prerequisites: Subject[];
}
