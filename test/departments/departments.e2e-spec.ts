import {
  HttpServer,
  HttpStatus,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Repository } from 'typeorm';

import { CreateDepartmentDto } from '../../src/departments/dto/create-department.dto';
import { DepartmentsModule } from '../../src/departments/departments.module';
import { SecretariatsModule } from '../../src/secretariats/secretariats.module';
import { SubjectsModule } from '../../src/subjects/subjects.module';
import { EnrolledSubjectsModule } from '../../src/enrolled-subjects/enrolled-subjects.module';
import { Department } from '../../src/departments/entities/department.entity';
import { Secretariat } from '../../src/secretariats/entities/secretariat.entity';
import { Teacher } from '../../src/teachers/entities/teacher.entity';
import { Student } from '../../src/students/entities/student.entity';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const departmentMocks = {
  valid: require('../mocks/departments/valid-department.json'),
  validDepartmentToList: require('../mocks/departments/valid-department-to-list.json'),
};

const studentsMocks = {
  validStudent: require('../mocks/students/valid-student.json'),
};

const teachersMocks = {
  validTeacher: require('../mocks/teachers/valid-teacher.json'),
};

describe('[Feature] Departments - /departments', () => {
  let app: INestApplication;
  let httpServer: HttpServer;

  let departmentRepository: MockRepository;
  let secretariatRepository: MockRepository;
  let teacherRepository: MockRepository;
  let studentRepository: MockRepository;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        DepartmentsModule,
        SecretariatsModule,
        SubjectsModule,
        EnrolledSubjectsModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5433,
          username: 'postgres',
          password: 'pass123',
          database: 'postgres',
          autoLoadEntities: true,
          synchronize: true,
        }),
      ],
      providers: [
        {
          provide: getRepositoryToken(Department),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Secretariat),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Teacher),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Student),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();
    httpServer = app.getHttpServer();

    departmentRepository = moduleFixture.get<MockRepository>(
      getRepositoryToken(Department),
    );

    secretariatRepository = moduleFixture.get<MockRepository>(
      getRepositoryToken(Secretariat),
    );

    teacherRepository = moduleFixture.get<MockRepository>(
      getRepositoryToken(Teacher),
    );

    studentRepository = moduleFixture.get<MockRepository>(
      getRepositoryToken(Student),
    );
  });

  it('Create [POST /] Should be able to create a new Department', async () => {
    return request(httpServer)
      .post('/departments')
      .send(departmentMocks.valid as CreateDepartmentDto)
      .expect(HttpStatus.CREATED)
      .then(({ body }) => {
        expect(body).toHaveProperty('name');
      });
  });

  it('Create [POST /] Should not be able to create a department with the same name that one already created ', async () => {
    const department = await departmentRepository.create(departmentMocks.valid);
    await departmentRepository.save(department);

    return request(httpServer)
      .post('/departments')
      .send(departmentMocks.valid as CreateDepartmentDto)
      .expect(HttpStatus.CONFLICT)
      .catch(({ error }) =>
        expect(error).toBe('Already exist a department with the same name'),
      );
  });

  it('Get one [GET /:id] Should not be able to return a Department with a invalid id', async () => {
    const invalidId = -1;

    return request(httpServer)
      .get(`/departments/${invalidId}`)
      .expect(HttpStatus.NOT_FOUND)
      .catch(({ error }) =>
        expect(error).toBe(`Department #${invalidId} not found`),
      );
  });

  it('Get one [GET /:id] Should be able to get a Department with a valid id', async () => {
    const department = await departmentRepository.create(departmentMocks.valid);
    const newDepartment = await departmentRepository.save(department);

    const secretariat = await secretariatRepository.create({
      type: 'graduation',
      department: newDepartment,
    });
    const newSecretariat = await secretariatRepository.save(secretariat);

    const {
      department: secretariatDepartment,
      ...parsedSecretariat
    } = newSecretariat;

    const student = await studentRepository.create({
      ...studentsMocks.validStudent,
      department: newDepartment,
    });
    const newStudent = await studentRepository.save(student);

    const { department: studentDepartment, ...parsedStudent } = newStudent;

    const teacher = await teacherRepository.create({
      ...teachersMocks.validTeacher,
      department: newDepartment,
    });
    const newTeacher = await teacherRepository.save(teacher);

    const { department: teacherDepartment, ...parsedTeacher } = newTeacher;

    return request(httpServer)
      .get(`/departments/${newDepartment.id}`)
      .expect(HttpStatus.OK)
      .then(({ body }) =>
        expect(body).toEqual({
          ...newDepartment,
          secretariats: [parsedSecretariat],
          students: [parsedStudent],
          teachers: [parsedTeacher],
        }),
      );
  });

  afterEach(async () => {
    await app.close();
  });
});
