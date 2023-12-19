import { verify, sign } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface UserInfo {
  id: number;
  userName: string;
}

function verifyAccessToken(token: string): {
  success: boolean;
  data?: UserInfo;
  error?: string;
} {
  //miért kell ide negálás?
  const secret = process.env.TOKEN_SECRET!.toString();

  try {
    const decoded = verify(token, secret);
    return { success: true, data: decoded as UserInfo };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export function signAccessToken(user: { id: number; userName: string }) {
  const secret = process.env.TOKEN_SECRET!.toString();

  const payload: UserInfo = {
    id: user.id,
    userName: user.userName,
    //és ha ez így belene írva hogy?
    //role: user.role
    //akkor pl a createuserbe írt commentem jó lehet e?
    //role: "tatata"
  };

  const token = sign(payload, secret, {
    expiresIn: "1h",
  });

  return token;
}

export function authenticateTokenMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  //ezt az && dolgot nem értem
  if (!token) {
    return res.sendStatus(401);
  }

  const result = verifyAccessToken(token);

  if (!result.success) {
    return res.status(403).json({ error: result.error });
  }

  req.user = result.data;
  next();
}
