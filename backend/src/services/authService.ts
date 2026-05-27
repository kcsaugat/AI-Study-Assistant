import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { signAccessToken, signRefreshToken, getRefreshExpiry } from '../utils/jwt';

export async function registerUser(email: string, name: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw Object.assign(new Error('Email already in use'), { statusCode: 409 });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, name, passwordHash },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  return user;
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  const payload = { userId: user.id, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: getRefreshExpiry() },
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
  };
}

export async function refreshAccessToken(token: string) {
  const stored = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!stored || stored.expiresAt < new Date()) {
    throw Object.assign(new Error('Refresh token invalid or expired'), { statusCode: 401 });
  }

  const payload = { userId: stored.user.id, email: stored.user.email };
  const accessToken = signAccessToken(payload);
  return { accessToken };
}

export async function logoutUser(token: string) {
  await prisma.refreshToken.deleteMany({ where: { token } });
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; email?: string; password?: string; avatarUrl?: string }
) {
  const updateData: Record<string, string> = {};
  if (data.name) updateData.name = data.name;
  if (data.email) updateData.email = data.email;
  if (data.avatarUrl) updateData.avatarUrl = data.avatarUrl;
  if (data.password) updateData.passwordHash = await bcrypt.hash(data.password, 12);

  return prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true },
  });
}
