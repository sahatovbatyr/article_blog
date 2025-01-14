import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({name: "roles"})
export class Role {

  @PrimaryGeneratedColumn()
   id!: number;

  @Column({ type:"varchar", nullable: false, unique: true })
   title!: string;



}
