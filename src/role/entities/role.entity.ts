import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'roles' })
export class Role {
  @ApiProperty({ example: '1', description: 'User Role id' })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 'ADMIN', description: 'Users role' })
  @Column({ type: 'varchar', nullable: false, unique: true })
  title!: string;
}
