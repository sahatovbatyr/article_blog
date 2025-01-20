import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import  { Exclude } from "class-transformer";
import { Role } from '../role/entities/role.entity';

@Entity({name:"users"})
export class User {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({type:"varchar", nullable: false, unique: true})
  username!: string;

  @Column({type:"varchar", nullable:false})
  password!: string;

  @Column({type:"boolean", nullable:false, default:false })
  is_active!: string;

  @Column({type:'varchar', nullable: false, unique:true})
  email!: string;

  @Column({ type:'boolean', nullable:false, default:false})
  is_email_verified!:boolean;


  @ManyToMany(() => Role )
  @JoinTable({
    name: "users_and_roles",
    joinColumn: {
      name: "user_id",
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "role_id",
      referencedColumnName: "id"
    }
  })
  roles!: Role[];



}