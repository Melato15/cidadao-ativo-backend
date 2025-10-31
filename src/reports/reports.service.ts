import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
  ) {}

  async create(createReportDto: CreateReportDto): Promise<Report> {
    const report = this.reportsRepository.create(createReportDto);
    return this.reportsRepository.save(report);
  }

  async findAll(): Promise<Report[]> {
    return this.reportsRepository.find({
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Report> {
    const report = await this.reportsRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!report) {
      throw new NotFoundException('Relatório não encontrado');
    }

    return report;
  }

  async findByAuthor(authorId: string): Promise<Report[]> {
    return this.reportsRepository.find({
      where: { authorId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: number,
    updateReportDto: UpdateReportDto,
    userId?: string,
  ): Promise<Report> {
    const report = await this.findOne(id);

    if (userId && report.authorId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar este relatório',
      );
    }

    await this.reportsRepository.update(id, updateReportDto);
    return this.findOne(id);
  }

  async remove(id: number, userId?: string): Promise<void> {
    const report = await this.findOne(id);

    if (userId && report.authorId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para excluir este relatório',
      );
    }

    await this.reportsRepository.delete(id);
  }
}
