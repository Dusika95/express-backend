import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
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
import createBookedAppointment from "./endpoints/bookedAppointments/createBookedAppointment";
import getAllBookedAppointment from "./endpoints/bookedAppointments/getAllBookedAppointment";
import deleteBookedAppointment from "./endpoints/bookedAppointments/deleteBookedAppointment";
import deleteAppointment from "./endpoints/openAppointments/deleteAppointment";
import updateOpenAppointment from "./endpoints/openAppointments/updateOpenAppointment";

const app = express();

app.use(loggingMiddleware);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.post("/users", authenticateTokenMiddleware, createUser);
app.get("/users", authenticateTokenMiddleware, getAll);
app.delete("/users", authenticateTokenMiddleware, deleteUser);

app.post("/signup", signUp);
app.post("/login", login);
app.put("/profile", authenticateTokenMiddleware, updateProfile);

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
app.delete(
  "/openappointments/:id",
  authenticateTokenMiddleware,
  deleteAppointment
);
app.put(
  "/openappointments/:id",
  authenticateTokenMiddleware,
  updateOpenAppointment
);

app.post(
  "/bookedappointments",
  authenticateTokenMiddleware,
  createBookedAppointment
);
app.get(
  "/bookedappointments",
  authenticateTokenMiddleware,
  getAllBookedAppointment
);
app.delete(
  "/bookedappointments/:id",
  authenticateTokenMiddleware,
  deleteBookedAppointment
);

export default app;
