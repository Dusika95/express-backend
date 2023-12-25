import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import { db } from "../../database";

export interface UserListDto {
  firstName: string;
  lastName: string;
  userName: string;
}

export default asyncHandler(async (req: Request, res: Response) => {
  if (req.user!.role === "admin") {
    let query = db.selectFrom("users");
    const result = await query.selectAll().execute();

    var response: UserListDto[] = result.map((x) => ({
      userName: x.userName,
      firstName: x.firstName,
      lastName: x.lastName,
    }));

    res.json(response);
  } else {
    res
      .json({ message: "you dont have the permisson to see all users" })
      .sendStatus(403);
  }
});
