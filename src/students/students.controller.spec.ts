import { Test, TestingModule } from '@nestjs/testing';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

describe('StudentsController', () => {
  let controller: StudentsController;
  let service: StudentsService;

  const mockStudentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [{ provide: StudentsService, useValue: mockStudentsService }],
    }).compile();

    controller = module.get<StudentsController>(StudentsController);
    service = module.get<StudentsService>(StudentsService);
  });

  it('aniqlanishi kerak', () => {
    expect(controller).toBeDefined();
  });

  it('create ishlashi kerak', async () => {
    const dto = { 
      name: 'John Doe', 
      email: 'john@example.com', 
      phone: '+998901234567', 
      course_id: 1 
    };
    mockStudentsService.create.mockResolvedValue({ 
      statusCode: 201,
      message: 'success',
      data: { id: 1, ...dto }
    });

    const result = await controller.create(dto as any);
    expect(result).toBeDefined();
    expect((result as any).data.id).toBe(1);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('findAll ishlashi kerak', async () => {
    mockStudentsService.findAll.mockResolvedValue({
      statusCode: 200,
      message: 'success',
      data: [{ id: 1, name: 'John Doe' }]
    });

    const result = await controller.findAll();
    expect(result).toBeDefined();
    expect((result as any).data[0].name).toBe('John Doe');
  });

  it('findOne ishlashi kerak', async () => {
    mockStudentsService.findOne.mockResolvedValue({
      statusCode: 200,
      message: 'success',
      data: { id: 1, name: 'John Doe', email: 'john@example.com' }
    });

    const result = await controller.findOne('1');
    expect(result).toBeDefined();
    expect((result as any).data.name).toBe('John Doe');
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('update ishlashi kerak', async () => {
    const dto = { 
      name: 'Updated John', 
      email: 'updated@example.com',
      phone: '+998909876543',
      course_id: 1
    };
    mockStudentsService.update.mockResolvedValue({
      statusCode: 200,
      message: 'success',
      data: { id: 1, ...dto }
    });

    const result = await controller.update('1', dto as any);
    expect(result).toBeDefined();
    expect((result as any).data.name).toBe('Updated John');
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('remove ishlashi kerak', async () => {
    mockStudentsService.remove.mockResolvedValue({
      statusCode: 204,
      message: 'success',
      data: { message: 'Student successfully deleted' }
    });

    const result = await controller.remove('1');
    expect(result).toBeDefined();
    expect((result as any).data.message).toBe('Student successfully deleted');
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});