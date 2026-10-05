import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  BaseEntity,
} from "typeorm";

import { Users } from "./user";
import { OrderItem } from "./orderItem";

@Entity("products")
export class Products extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({unique:true})
  sku!: string;

  @Column()
  category!: string;

  @Column({ type: "decimal" })
  mrp!: number;

  @Column({ type: "decimal" })
  selling_price!: number;

  @Column({ type: "decimal" })
  discount!: number;

  @Column({ type: "int" })
  quantity!: number;

  @ManyToMany(() => Users, (users) => users.products)
  @JoinTable()
  users!: Users[];

  @OneToMany(() => OrderItem, (item) => item.product, {
    cascade: true,
    onDelete: "CASCADE",
  })
  orderItems!: OrderItem[];
}
