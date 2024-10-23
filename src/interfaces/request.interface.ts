import { Request } from 'express';

export interface ValidatedRequest extends Request {
  user: {
    id: string;
  };
}
