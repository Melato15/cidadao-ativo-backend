import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo relatório' })
  create(@Body() createReportDto: CreateReportDto, @Request() req: any) {
    return this.reportsService.create({
      ...createReportDto,
      authorId: req.user.sub,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os relatórios' })
  findAll() {
    return this.reportsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar relatório por ID' })
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(+id);
  }

  @Get('author/:authorId')
  @ApiOperation({ summary: 'Buscar relatórios por autor' })
  findByAuthor(@Param('authorId') authorId: string) {
    return this.reportsService.findByAuthor(authorId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar relatório' })
  update(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
    @Request() req: any,
  ) {
    return this.reportsService.update(+id, updateReportDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir relatório' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.reportsService.remove(+id, req.user.sub);
  }
}
