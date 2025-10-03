import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  readonly users = [
    {
      id: '1',
      cpf: '13271936986',
      password: '3d4f5y62d',
    },
  ];

  async findByCpf(cpf: string) {
    return this.users.find((user) => user.cpf === cpf);
  }

  async findById(id: string) {
    return this.users.find((user) => user.id === id);
  }

  async findAll() {
    return this.users;
  }

  async create(user: CreateUserDto) {
    this.users.push({ id: Date.now().toString(), ...user });
    return user;
  }

  async validatePassword(cpf: string, password: string): Promise<boolean> {
    const user = await this.findByCpf(cpf);
    if (!user) return false;
    return user.password === password;
  }
}
