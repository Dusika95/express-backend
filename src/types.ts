import {
  ColumnType,
  Generated,
  Insertable,
  Selectable,
  Updateable,
} from "kysely";

export interface Database {
  users: UserTable;
  openAppointments: OpenAppointmentTable;
  bookedAppointments: OpenAppointmentTable;
}

export interface UserTable {
  id: Generated<number>;
  firstName: string;
  lastName: string;
  userName: string;
  role: "medic" | "client" | "admin";
  passwordHash: string;
  salt: string;
}
export interface OpenAppointmentTable {
  id: Generated<number>;
  startDate: ColumnType<Date>;
  endDate: ColumnType<Date>;
  mdId: number;
}

export interface BookedAppointmentTable {
  id: Generated<number>;
  clientId: number;
  openAppointmentId: number;
}

export type Users = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

export type OpenAppointments = Selectable<OpenAppointmentTable>;
export type NewOpenAppointment = Insertable<OpenAppointmentTable>;
export type OpenAppointmentUpdate = Updateable<OpenAppointmentTable>;

export type BookedAppointments = Selectable<BookedAppointmentTable>;
export type NewBookedAppointment = Insertable<BookedAppointmentTable>;
export type BookedAppointmentUpdate = Updateable<BookedAppointmentTable>;
