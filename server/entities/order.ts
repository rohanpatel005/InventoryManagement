import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  BaseEntity,
  CreateDateColumn,
} from "typeorm";

import { Users } from "./user";
import { OrderItem } from "./orderItem";

export enum Status {
  ACCEPTED = "accepted",
  CANCELLED = "cancelled",
}

@Entity("orders")
export class Orders extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "enum",
    enum: Status,
    default: Status.ACCEPTED,
  })
  status!: Status;

  @ManyToOne(() => Users, (user) => user.orders)
  @JoinColumn({ name: "user_id" })
  user!: Users;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalPrice!: number;

  @CreateDateColumn({
    type: "timestamp",
  })
  orderDate!: Date;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
  })
  items!: OrderItem[];
}
