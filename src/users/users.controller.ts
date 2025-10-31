import {
  Controller,
  UseGuards,
  Get,
  Post,
  Param,
  Body,
  Patch,
  Delete,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo usuário (registro)' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    // Remove a senha da resposta
    const { password, ...result } = user as any;
    return result;
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter dados do usuário logado' })
  async getProfile(@Request() req: any) {
    return this.usersService.findById(req.user.sub);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get('cpf/:cpf')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar usuário por CPF' })
  async findByCpf(@Param('cpf') cpf: string) {
    return this.usersService.findByCpf(cpf);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar dados do usuário' })
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateUserDto>,
  ) {
    return this.usersService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir usuário' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
  }
}
