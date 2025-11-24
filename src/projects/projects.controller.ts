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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.COUNCILOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo projeto' })
  create(@Body() createProjectDto: CreateProjectDto, @Request() req: any) {
    return this.projectsService.create({
      ...createProjectDto,
      authorId: req.user.sub,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os projetos' })
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar projeto por ID' })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Get('author/:authorId')
  @ApiOperation({ summary: 'Buscar projetos por autor' })
  findByAuthor(@Param('authorId') authorId: string) {
    return this.projectsService.findByAuthor(authorId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.COUNCILOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar projeto' })
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req: any,
  ) {
    return this.projectsService.update(id, updateProjectDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.COUNCILOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir projeto' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.projectsService.remove(id, req.user.sub);
  }

  @Post(':id/vote/:type')
  @ApiOperation({ summary: 'Votar em um projeto' })
  vote(@Param('id') id: string, @Param('type') type: 'for' | 'against') {
    return this.projectsService.vote(id, type);
  }
}
