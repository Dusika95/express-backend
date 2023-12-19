import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import * as dotenv from "dotenv";
import cors from "cors";
dotenv.config();

import getAll from "./endpoints/users/getAll";
import createUser from "./endpoints/users/createUser";
import deleteUser from "./endpoints/users/deleteUser";
import signUp from "./endpoints/signUp";
import login from "./endpoints/login";
import { authenticateTokenMiddleware } from "./middlewares/authentication";
import { loggingMiddleware } from "./middlewares/logging";
import updateProfile from "./endpoints/updateProfile";
import createOpenAppointment from "./endpoints/openAppointments/createOpenAppointment";
import getAllOpenAppointment from "./endpoints/openAppointments/getAllOpenAppointment";

const app = express();

app.use(loggingMiddleware);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.post("/users", createUser);
app.get("/users", authenticateTokenMiddleware, getAll);

app.post("/signup", signUp);
app.post("/login", login);
app.post("/profile", authenticateTokenMiddleware, updateProfile);

app.post(
  "/openappointments",
  authenticateTokenMiddleware,
  createOpenAppointment
);
app.get(
  "/openappointments",
  authenticateTokenMiddleware,
  getAllOpenAppointment
);

app.listen(process.env.PORT, () => {
  console.log("app is running");
});
