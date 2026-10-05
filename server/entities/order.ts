import {Entity, PrimaryGeneratedColumn ,Column, ManyToOne,JoinColumn,OneToMany, BaseEntity  } from "typeorm"
import { EntityMetadataValidator } from "typeorm/metadata-builder/EntityMetadataValidator";
import { Users } from "./user";

import { Products } from "./product";
import { OrderItem } from "./orderItem";

export enum Status {
  ACCEPTED = "accepted",
  CANCELLED = "cancelled",
  
}


@Entity("orders")
export class Orders extends BaseEntity{
    @PrimaryGeneratedColumn()
    id!:Number  
  
    @Column({type:"enum",enum:Status,default:Status.ACCEPTED})
    status!: Status;
    @ManyToOne(()=>Users,user=>user.orders)
    @JoinColumn({name:"user_id"})
    user!:Users 
    @OneToMany(() => OrderItem, (item) => item.order, {
  cascade: true,
})
items!: OrderItem[];

}