import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { In, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as console from 'node:console';

@Injectable()
export class RoleService {

  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>
  ) {
  }

  async findByTitle( title: string) {

    const role = await this.roleRepository.findOneBy({title});

    if ( !role ) {
      throw new NotFoundException(`Role: ${title} not found.`);
    }

    return  role;

  }

  async getRolesByIdList( roleIdList: number[]) {
     return await this.roleRepository.find({ where:{id: In(roleIdList)}});
  }



 async create(createRoleDto: CreateRoleDto) {

    const roleByTitle = await this.findByTitle(createRoleDto.title);

    if ( roleByTitle ) {
      throw new ConflictException(`Dublicate role ${createRoleDto.title}.`);
    }

    const roleTemp = await this.roleRepository.create(createRoleDto);
    const res = await this.roleRepository.save(roleTemp);
    return res;
  }

  async findAll() {
    return await this.roleRepository.find();
  }

  async findOne(id: number) {
    return await this.roleRepository.findOne({where:{id}});
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepository.findOne({where:{id}});
    if (!role) {
      throw new NotFoundException(`Role with id: ${id} not found.`);
    }
    role.title = updateRoleDto.title;
    this.roleRepository.save(role);
    return `This action updates a #${id} role`;
  }

  async remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
