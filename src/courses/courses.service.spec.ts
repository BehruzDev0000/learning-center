import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { getModelToken } from '@nestjs/sequelize';
import { Course } from './entities/course.entity';

const mockRedis = {
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
};

const mockCourseModel = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
};

describe('CoursesService', () => {
  let service: CoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: getModelToken(Course), useValue: mockCourseModel },
        { provide: 'default_IORedisModuleConnectionToken', useValue: mockRedis },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('aniqlanishi kerak', () => {
    expect(service).toBeDefined();
  });

  it('create ishlashi kerak', async () => {
    const dto = {
      name: 'NestJS',
      description: 'Backend course',
      start_date: '2025-09-01',
      end_date: '2025-09-30',
    };

    mockCourseModel.create.mockResolvedValue({ id: 1, ...dto });
    mockRedis.del.mockResolvedValue(1);

    const result = await service.create(dto as any);
    expect(result).toBeDefined();
    expect((result!.data as any).name).toBe('NestJS');
    expect(mockCourseModel.create).toHaveBeenCalledWith({ ...dto });
    expect(mockRedis.del).toHaveBeenCalledWith('courses:all');
  });

  it('findAll cache ishlashi kerak', async () => {
    const cached = [{ id: 1, name: 'JS course' }];
    mockRedis.get.mockResolvedValue(JSON.stringify(cached));

    const result = await service.findAll();
    expect(result).toBeDefined();
    expect((result!.data as any)[0].name).toBe('JS course');
    expect(mockRedis.get).toHaveBeenCalledWith('courses:all');
  });

  it('findOne topilmasa NotFoundException', async () => {
    mockCourseModel.findOne.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toThrow('Course not found');
  });

  it('findAll database dan cache ga yuklash', async () => {
    const courses = [{ id: 1, name: 'NestJS', description: 'Backend course' }];
    mockRedis.get.mockResolvedValue(null);
    mockCourseModel.findAll.mockResolvedValue(courses);
    mockRedis.setex.mockResolvedValue('OK');

    const result = await service.findAll();
    expect(result).toBeDefined();
    expect((result!.data as any)[0].name).toBe('NestJS');
    expect(mockCourseModel.findAll).toHaveBeenCalled();
    expect(mockRedis.setex).toHaveBeenCalledWith('courses:all', 300, JSON.stringify(courses));
  });

  it('findOne muvaffaqiyatli topish', async () => {
    const course = { id: 1, name: 'NestJS', description: 'Backend course' };
    mockCourseModel.findOne.mockResolvedValue(course);

    const result = await service.findOne(1);
    expect(result).toBeDefined();
    expect((result!.data as any).name).toBe('NestJS');
    expect(mockCourseModel.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('update muvaffaqiyatli ishlash', async () => {
    const dto = {
      name: 'Updated NestJS',
      description: 'Updated description',
      start_date: '2025-10-01',
      end_date: '2025-10-30',
    };
    const updatedCourse = [1, [{ id: 1, ...dto }]];
    mockCourseModel.update.mockResolvedValue(updatedCourse);
    mockRedis.del.mockResolvedValue(1);

    const result = await service.update(1, dto as any);
    expect(result).toBeDefined();
    expect(mockCourseModel.update).toHaveBeenCalledWith(dto, { where: { id: 1 }, returning: true });
    expect(mockRedis.del).toHaveBeenCalledWith('courses:all');
  });

  it('update topilmasa NotFoundException', async () => {
    const dto = {
      name: 'Updated NestJS',
      description: 'Updated description',
      start_date: '2025-10-01',
      end_date: '2025-10-30',
    };
    mockCourseModel.update.mockResolvedValue([0]);

    await expect(service.update(99, dto as any)).rejects.toThrow('Course not found');
  });

  it('remove muvaffaqiyatli ishlash', async () => {
    mockCourseModel.destroy.mockResolvedValue(1);
    mockRedis.del.mockResolvedValue(1);

    const result = await service.remove(1);
    expect(result).toBeDefined();
    expect((result!.data as any).message).toBe('Course successfully deleted');
    expect(mockCourseModel.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(mockRedis.del).toHaveBeenCalledWith('courses:all');
  });

  it('remove topilmasa NotFoundException', async () => {
    mockCourseModel.destroy.mockResolvedValue(0);

    await expect(service.remove(99)).rejects.toThrow('Course not found');
  });

  it('create start_date > end_date BadRequestException', async () => {
    const dto = {
      name: 'Invalid Course',
      description: 'Invalid dates',
      start_date: '2025-10-30',
      end_date: '2025-10-01',
    };

    await expect(service.create(dto as any)).rejects.toThrow('Start date cannot be greater than end date');
  });

  it('update start_date > end_date BadRequestException', async () => {
    const dto = {
      name: 'Invalid Course',
      description: 'Invalid dates',
      start_date: '2025-10-30',
      end_date: '2025-10-01',
    };

    await expect(service.update(1, dto as any)).rejects.toThrow('Start date cannot be greater than end date');
  });
});
