import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByCpf(cpf: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { cpf } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verifica se o email já existe
    const existingEmail = await this.findByEmail(createUserDto.email);
    if (existingEmail) {
      throw new ConflictException('Email já cadastrado');
    }

    // Verifica se o CPF já existe
    const existingCpf = await this.findByCpf(createUserDto.cpf);
    if (existingCpf) {
      throw new ConflictException('CPF já cadastrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await this.usersRepository.update(id, updateData);
    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new NotFoundException('Usuário não encontrado após atualização');
    }
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Usuário não encontrado');
    }
  }

  async validatePassword(cpf: string, password: string): Promise<boolean> {
    const user = await this.findByCpf(cpf);
    if (!user) return false;
    return bcrypt.compare(password, user.password);
  }
}
