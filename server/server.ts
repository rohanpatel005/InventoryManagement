import express from "express";
import { DataSource } from "typeorm";
import { Users } from "./entities/user";
import { Products } from "./entities/product";
import { Orders } from "./entities/order";

import { OrderItem } from "./entities/orderItem";
import { userRouter } from "./routes/userRoutes";
import cp from "cookie-parser";
import dotenv from "dotenv"
import { productRouter } from "./routes/productRoutes";
dotenv.config()

const app = express();
app.use(cp())
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


const appDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "2005",
  database: "postgres",
  entities: [Users, Products, Orders,  OrderItem],
  synchronize: true,
});

app.use(userRouter);
app.use(productRouter)
app.get("/", (req, res) => {
  res.send("Hello from the backend of inventory management system");
});

appDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully");


    app.listen(3000, () => {
      console.log("Server started on port 3000");
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });
