import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { generateAccessToken, generateRefreshToken, verifyAccessToken } from '../lib/jwt';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../utils/errors';

const SALT_ROUNDS = 12;

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// ─── Register ─────────────────────────────────────────────────────────────────
export async function register(
  input: RegisterInput
): Promise<{ user: UserResponse; tokens: AuthTokens }> {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (existingUser) {
    throw new ConflictError('An account with this email already exists');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  // Create user
  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email: input.email.toLowerCase().trim(),
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  // Generate tokens
  const tokens = await createTokenPair(user.id, user.email);

  return { user, tokens };
}

// ─── Login ────────────────────────────────────────────────────────────────────
export async function login(
  input: LoginInput
): Promise<{ user: UserResponse; tokens: AuthTokens }> {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (!user) {
    // Use same error to prevent user enumeration
    throw new UnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const tokens = await createTokenPair(user.id, user.email);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    tokens,
  };
}

// ─── Refresh ──────────────────────────────────────────────────────────────────
export async function refresh(
  refreshToken: string
): Promise<AuthTokens> {
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!tokenRecord || tokenRecord.revoked) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  if (tokenRecord.expiresAt < new Date()) {
    // Clean up expired token
    await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
    throw new UnauthorizedError('Refresh token expired, please log in again');
  }

  // Rotate refresh token (revoke old, issue new)
  await prisma.refreshToken.update({
    where: { id: tokenRecord.id },
    data: { revoked: true },
  });

  const tokens = await createTokenPair(tokenRecord.user.id, tokenRecord.user.email);
  return tokens;
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logout(refreshToken: string, userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken, userId },
    data: { revoked: true },
  });
}

// ─── Logout All (revoke all refresh tokens for user) ─────────────────────────
export async function logoutAll(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId },
    data: { revoked: true },
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function createTokenPair(userId: string, email: string): Promise<AuthTokens> {
  const accessToken = generateAccessToken({ userId, email });
  const { token: refreshToken, expiresAt } = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt,
    },
  });

  return { accessToken, refreshToken };
}
