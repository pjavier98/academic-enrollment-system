import { EnrolledSubject } from 'src/enrolled-subjects/entities/enrolled-subject.entity';
import { Student } from 'src/students/entities/student.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
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

  @ManyToOne(() => Subject, (subject) => subject.subject, {
    nullable: true,
  })
  subject: Subject;

  @OneToMany(() => Subject, (subject) => subject.subjects, {
    nullable: true,
  })
  subjects: Subject[];

  @OneToMany(
    () => EnrolledSubject,
    (enrolledSubject) => enrolledSubject.subject,
  )
  enrolledSubjects: EnrolledSubject[];
}
