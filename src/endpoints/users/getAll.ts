import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import { db } from "../../database";

interface UserListDto {
  firstName: string;
  lastName: string;
  userName: string;
}

export default asyncHandler(async (req: Request, res: Response) => {
  let query = db.selectFrom("users");
  const result = await query.selectAll().execute();

  var response: UserListDto[] = result.map((x) => ({
    userName: x.userName,
    firstName: x.firstName,
    lastName: x.lastName,
  }));

  res.json(response);
});
