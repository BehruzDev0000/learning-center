import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

describe('CoursesController', () => {
  let controller: CoursesController;
  let service: CoursesService;

  const mockCoursesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [{ provide: CoursesService, useValue: mockCoursesService }],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
    service = module.get<CoursesService>(CoursesService);
  });

  it('aniqlanishi kerak', () => {
    expect(controller).toBeDefined();
  });

  it('create ishlashi kerak', async () => {
    const dto = { name: 'NestJS', description: 'Test', start_date: '2025-09-01', end_date: '2025-09-30' };
    mockCoursesService.create.mockResolvedValue({ id: 1, ...dto });

    const result = await controller.create(dto as any);
    expect(result.id).toBe(1);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('findAll ishlashi kerak', async () => {
    mockCoursesService.findAll.mockResolvedValue({
      statusCode: 200,
      message: 'success',
      data: [{ id: 1, name: 'NestJS' }]
    });

    const result = await controller.findAll();
    expect(result).toBeDefined();
    expect((result as any).data[0].name).toBe('NestJS');
  });

  it('findOne ishlashi kerak', async () => {
    mockCoursesService.findOne.mockResolvedValue({
      statusCode: 200,
      message: 'success',
      data: { id: 1, name: 'NestJS' }
    });

    const result = await controller.findOne('1');
    expect(result).toBeDefined();
    expect((result as any).data.name).toBe('NestJS');
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('update ishlashi kerak', async () => {
    const dto = { 
      name: 'Updated NestJS', 
      description: 'Updated description',
      start_date: '2025-10-01',
      end_date: '2025-10-30'
    };
    mockCoursesService.update.mockResolvedValue({
      statusCode: 200,
      message: 'success',
      data: { id: 1, ...dto }
    });

    const result = await controller.update('1', dto as any);
    expect(result).toBeDefined();
    expect((result as any).data.name).toBe('Updated NestJS');
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('remove ishlashi kerak', async () => {
    mockCoursesService.remove.mockResolvedValue({
      statusCode: 204,
      message: 'success',
      data: { message: 'Course successfully deleted' }
    });

    const result = await controller.remove('1');
    expect(result).toBeDefined();
    expect((result as any).data.message).toBe('Course successfully deleted');
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
