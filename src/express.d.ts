declare namespace Express {
  export interface Request {
    user?: User;
  }
  export interface User {
    id: number;
    userName: string;
    role: string;
  }
}
