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
import { errorHandler } from "./middleware/errorHandler";

dotenv.config()

const app = express();
app.use(cp())
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));






const db_host = process.env.DB_HOST
const db_port = process.env.DB_PORT
const db_name = process.env.DB_NAME
const db_user = process.env.DB_USER
const db_password = process.env.DB_PASSWORD


const appDataSource = new DataSource({
  type: "postgres",
  host: db_host,
  port: Number(db_port),
  username: db_user,
  password: db_password,
  database: db_name,
  entities: [Users, Products, Orders,  OrderItem],
  synchronize: false,
  migrations: ["src/migrations/*.ts"],
});

app.use(userRouter);
app.use(productRouter)
app.get("/", (req, res) => {
  res.send("Hello from the backend of inventory management system");
});
app.use(errorHandler)
appDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully");


    app.listen( Number(process.env.PORT), () => {
      console.log("Server started");
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });
