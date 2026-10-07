import {Entity, PrimaryGeneratedColumn ,Column, ManyToMany, JoinColumn, OneToMany, JoinTable, BaseEntity  } from "typeorm"

import { Orders } from "./order";
import { Products } from "./product";

export enum Role{ADMIN="admin",MANAGER="manager",USER="user"}
@Entity("users")
export class Users extends BaseEntity{
    @PrimaryGeneratedColumn()
    id!:Number  
    @Column()
    name!:string;
    @Column({type:"varchar",length:10})
    number!:string
    @Column({unique:true})
    email!:string
    @Column()
    password!:string
    @Column()
    address!:string
    @Column({type:"enum",enum:Role})
    role!:Role
     
    @OneToMany(() => Orders, (orders) => orders.user)
    orders!: Orders[];
    
    @ManyToMany(()=>Products,products=>products.users)
    products!:Products[]
}