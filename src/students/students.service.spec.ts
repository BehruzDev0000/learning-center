import { Test, TestingModule } from '@nestjs/testing';
import { StudentsService } from './students.service';
import { getModelToken } from '@nestjs/sequelize';
import { Student } from './entities/student.entity';
import { Course } from '../courses/entities/course.entity';

const mockRedis = {
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
};

const mockStudentModel = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
};

const mockCourseModel = {
  findOne: jest.fn(),
};

describe('StudentsService', () => {
  let service: StudentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: getModelToken(Student), useValue: mockStudentModel },
        { provide: getModelToken(Course), useValue: mockCourseModel },
        { provide: 'default_IORedisModuleConnectionToken', useValue: mockRedis },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('aniqlanishi kerak', () => {
    expect(service).toBeDefined();
  });

  it('create ishlashi kerak', async () => {
    const dto = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+998901234567',
      course_id: 1,
    };

    mockStudentModel.findOne.mockResolvedValueOnce(null);
    mockStudentModel.findOne.mockResolvedValueOnce(null);
    mockCourseModel.findOne.mockResolvedValue({ id: 1, name: 'NestJS Course' });
    mockStudentModel.create.mockResolvedValue({ id: 1, ...dto });
    mockRedis.del.mockResolvedValue(1);

    const result = await service.create(dto as any);
    expect(result).toBeDefined();
    expect((result!.data as any).name).toBe('John Doe');
    expect(mockStudentModel.create).toHaveBeenCalledWith({ ...dto });
    expect(mockRedis.del).toHaveBeenCalledWith('students:all');
  });

  it('findAll cache ishlashi kerak', async () => {
    const cached = [{ id: 1, name: 'John Doe', email: 'john@example.com' }];
    mockRedis.get.mockResolvedValue(JSON.stringify(cached));

    const result = await service.findAll();
    expect(result).toBeDefined();
    expect((result!.data as any)[0].name).toBe('John Doe');
    expect(mockRedis.get).toHaveBeenCalledWith('students:all');
  });

  it('findOne topilmasa NotFoundException', async () => {
    mockStudentModel.findOne.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toThrow('Student not found');
  });

  it('findAll database dan cache ga yuklash', async () => {
    const students = [{ id: 1, name: 'John Doe', email: 'john@example.com' }];
    mockRedis.get.mockResolvedValue(null);
    mockStudentModel.findAll.mockResolvedValue(students);
    mockRedis.setex.mockResolvedValue('OK');

    const result = await service.findAll();
    expect(result).toBeDefined();
    expect((result!.data as any)[0].name).toBe('John Doe');
    expect(mockStudentModel.findAll).toHaveBeenCalled();
    expect(mockRedis.setex).toHaveBeenCalledWith('students:all', 300, JSON.stringify(students));
  });

  it('findOne muvaffaqiyatli topish', async () => {
    const student = { id: 1, name: 'John Doe', email: 'john@example.com' };
    mockStudentModel.findOne.mockResolvedValue(student);

    const result = await service.findOne(1);
    expect(result).toBeDefined();
    expect((result!.data as any).name).toBe('John Doe');
    expect(mockStudentModel.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('create email mavjud ConflictException', async () => {
    const dto = {
      name: 'John Doe',
      email: 'existing@example.com',
      phone: '+998901234567',
      course_id: 1,
    };

    mockStudentModel.findOne.mockResolvedValueOnce({ id: 2, email: 'existing@example.com' });

    await expect(service.create(dto as any)).rejects.toThrow('Email already exists');
  });

  it('create phone mavjud ConflictException', async () => {
    const dto = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+998901111111',
      course_id: 1,
    };

    mockStudentModel.findOne.mockResolvedValueOnce(null);
    mockStudentModel.findOne.mockResolvedValueOnce({ id: 2, phone: '+998901111111' });

    await expect(service.create(dto as any)).rejects.toThrow('Phone number already exists');
  });

  it('create course topilmasa NotFoundException', async () => {
    const dto = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+998901234567',
      course_id: 99,
    };

    mockStudentModel.findOne.mockResolvedValueOnce(null);
    mockStudentModel.findOne.mockResolvedValueOnce(null);
    mockCourseModel.findOne.mockResolvedValue(null);

    await expect(service.create(dto as any)).rejects.toThrow('Course not found');
  });

  it('update muvaffaqiyatli ishlash', async () => {
    const dto = {
      name: 'Updated John',
      email: 'updated@example.com',
      phone: '+998909876543',
      course_id: 1,
    };
    const updatedStudent = [1, [{ id: 1, ...dto }]];
    mockStudentModel.findOne.mockResolvedValueOnce(null);
    mockStudentModel.findOne.mockResolvedValueOnce(null);
    mockCourseModel.findOne.mockResolvedValue({ id: 1, name: 'NestJS Course' });
    mockStudentModel.update.mockResolvedValue(updatedStudent);
    mockRedis.del.mockResolvedValue(1);

    const result = await service.update(1, dto as any);
    expect(result).toBeDefined();
    expect(mockStudentModel.update).toHaveBeenCalledWith(dto, { where: { id: 1 }, returning: true });
    expect(mockRedis.del).toHaveBeenCalledWith('students:all');
  });

  it('update topilmasa NotFoundException', async () => {
    const dto = {
      name: 'Updated John',
      email: 'updated@example.com',
      phone: '+998909876543',
      course_id: 1,
    };
    mockStudentModel.findOne.mockResolvedValueOnce(null);
    mockStudentModel.findOne.mockResolvedValueOnce(null);
    mockCourseModel.findOne.mockResolvedValue({ id: 1, name: 'NestJS Course' });
    mockStudentModel.update.mockResolvedValue([0]);

    await expect(service.update(99, dto as any)).rejects.toThrow('Student not found');
  });

  it('update email mavjud ConflictException', async () => {
    const dto = {
      name: 'Updated John',
      email: 'existing@example.com',
      phone: '+998909876543',
      course_id: 1,
    };

    mockStudentModel.findOne.mockResolvedValueOnce({ id: 2, email: 'existing@example.com' });

    await expect(service.update(1, dto as any)).rejects.toThrow('Email already exists');
  });

  it('update phone mavjud ConflictException', async () => {
    const dto = {
      name: 'Updated John',
      email: 'updated@example.com',
      phone: '+998901111111',
      course_id: 1,
    };

    mockStudentModel.findOne.mockResolvedValueOnce(null);
    mockStudentModel.findOne.mockResolvedValueOnce({ id: 2, phone: '+998901111111' });

    await expect(service.update(1, dto as any)).rejects.toThrow('Phone number already exists');
  });

  it('update course topilmasa NotFoundException', async () => {
    const dto = {
      name: 'Updated John',
      email: 'updated@example.com',
      phone: '+998909876543',
      course_id: 99,
    };

    mockStudentModel.findOne.mockResolvedValueOnce(null);
    mockStudentModel.findOne.mockResolvedValueOnce(null);
    mockCourseModel.findOne.mockResolvedValue(null);

    await expect(service.update(1, dto as any)).rejects.toThrow('Course not found');
  });

  it('remove muvaffaqiyatli ishlash', async () => {
    mockStudentModel.destroy.mockResolvedValue(1);
    mockRedis.del.mockResolvedValue(1);

    const result = await service.remove(1);
    expect(result).toBeDefined();
    expect((result!.data as any).message).toBe('Student successfully deleted');
    expect(mockStudentModel.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(mockRedis.del).toHaveBeenCalledWith('students:all');
  });

  it('remove topilmasa NotFoundException', async () => {
    mockStudentModel.destroy.mockResolvedValue(0);

    await expect(service.remove(99)).rejects.toThrow('Student not found');
  });
});