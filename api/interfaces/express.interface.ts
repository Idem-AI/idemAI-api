import { Request } from 'express';
import admin from 'firebase-admin';

export interface CustomRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}
