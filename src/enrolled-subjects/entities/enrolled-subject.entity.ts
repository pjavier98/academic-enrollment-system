import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Subject } from '../../subjects/entities/subject.entity';
import { Student } from '../../students/entities/student.entity';

@Entity('enrolled-subjects')
export class EnrolledSubject {
  @PrimaryGeneratedColumn()
  id: string;

  @Column('float')
  grade: number;

  @Column()
  isAapproved: boolean;

  @ManyToOne(() => Subject, (subject) => subject.enrolledSubjects)
  subject: Subject;

  @ManyToOne(() => Student, (student) => student.enrolledSubjects)
  student: Student;
}
