import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_SECRET ?? 'dev-access-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret';
const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';

export interface JwtPayload {
  userId: string;
  email: string;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
}

export function getRefreshExpiry(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
}
