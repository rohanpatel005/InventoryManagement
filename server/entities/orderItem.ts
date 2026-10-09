import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from "typeorm";

import { Orders } from "./order";
import { Products } from "./product";

@Entity("order_items")
export class OrderItem extends BaseEntity {
  @PrimaryGeneratedColumn({type:"int"})
  id!: number;

  @Column({type:"int"})
  quantity!: number;

  @ManyToOne(() => Orders, (order) => order.items, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "order_id" })
  order!: Orders;
@ManyToOne(() => Products, (product) => product.orderItems, {
  onDelete: "SET NULL",
  nullable: true,
})
@JoinColumn({ name: "product_id" })
product!: Products;
@Column({type:"decimal"})
price!:number;

}
