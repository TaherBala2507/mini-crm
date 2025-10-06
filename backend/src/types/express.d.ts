import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser & { permissions: string[] };
      correlationId?: string;
    }
  }
}

export {};