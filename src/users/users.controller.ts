import { Controller, UseGuards, Get, Post, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':cpf')
  @UseGuards(AuthGuard)
  findByCpf(@Param('cpf') cpf: string) {
    return this.usersService.findByCpf(cpf);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() user: CreateUserDto) {
    return this.usersService.create(user);
  }
}
