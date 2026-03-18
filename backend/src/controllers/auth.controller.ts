import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { sendSuccess, sendCreated } from '../utils/response.utils';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { UnauthorizedError } from '../utils/errors';

// POST /auth/register
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email, password } = req.body;
    const { user, tokens } = await authService.register({ name, email, password });

    // Set refresh token as HttpOnly cookie for security
    setRefreshTokenCookie(res, tokens.refreshToken);

    sendCreated(res, { user, accessToken: tokens.accessToken }, 'Account created successfully');
  } catch (error) {
    next(error);
  }
}

// POST /auth/login
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;
    const { user, tokens } = await authService.login({ email, password });

    setRefreshTokenCookie(res, tokens.refreshToken);

    sendSuccess(res, { user, accessToken: tokens.accessToken }, 'Login successful');
  } catch (error) {
    next(error);
  }
}

// POST /auth/refresh
export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Accept refresh token from either cookie or request body
    const refreshToken =
      req.cookies?.refreshToken ||
      req.body?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedError('No refresh token provided');
    }

    const tokens = await authService.refresh(refreshToken);
    setRefreshTokenCookie(res, tokens.refreshToken);

    sendSuccess(res, { accessToken: tokens.accessToken }, 'Token refreshed');
  } catch (error) {
    next(error);
  }
}

// POST /auth/logout
export async function logout(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    const userId = req.user!.userId;

    if (refreshToken) {
      await authService.logout(refreshToken, userId);
    }

    // Clear the cookie
    res.clearCookie('refreshToken', getCookieOptions());
    sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
}

// GET /auth/me
export async function getMe(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    sendSuccess(res, { user: req.user }, 'User retrieved');
  } catch (error) {
    next(error);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };
}

function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie('refreshToken', token, getCookieOptions());
}
