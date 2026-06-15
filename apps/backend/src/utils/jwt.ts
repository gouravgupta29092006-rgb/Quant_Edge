import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { readFileSync } from 'fs';
import path from 'path';
import { UserRole } from '@prisma/client';
import { InvalidTokenError } from './errors';

// ─── JWT Types ────────────────────────────────────────────────
export interface JwtPayload {
  sub: string;          // User ID
  email: string;
  role: UserRole;
  type: 'access' | 'refresh' | 'interim';
  iat?: number;
  exp?: number;
}

// ─── Load RSA Keys ────────────────────────────────────────────
function loadPrivateKey(): string {
  if (process.env.JWT_PRIVATE_KEY) {
    return process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n');
  }

  try {
    const keyPath = path.resolve(process.cwd(), 'keys', 'private.pem');
    return readFileSync(keyPath, 'utf-8');
  } catch {
    throw new Error('JWT_PRIVATE_KEY not set and keys/private.pem not found');
  }
}

function loadPublicKey(): string {
  if (process.env.JWT_PUBLIC_KEY) {
    return process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n');
  }

  try {
    const keyPath = path.resolve(process.cwd(), 'keys', 'public.pem');
    return readFileSync(keyPath, 'utf-8');
  } catch {
    throw new Error('JWT_PUBLIC_KEY not set and keys/public.pem not found');
  }
}

// ─── Token Generation ─────────────────────────────────────────
export function generateAccessToken(payload: Omit<JwtPayload, 'type' | 'iat' | 'exp'>): string {
  const options: SignOptions = {
    algorithm: 'RS256',
    expiresIn: parseInt(process.env.JWT_ACCESS_EXPIRY ?? '900', 10),
  };

  return jwt.sign(
    { ...payload, type: 'access' },
    loadPrivateKey(),
    options
  );
}

export function generateRefreshToken(
  payload: Omit<JwtPayload, 'type' | 'iat' | 'exp'>,
  rememberMe = false
): string {
  const options: SignOptions = {
    algorithm: 'RS256',
    expiresIn: rememberMe ? 30 * 24 * 60 * 60 : parseInt(process.env.JWT_REFRESH_EXPIRY ?? '2592000', 10),
  };

  return jwt.sign(
    { ...payload, type: 'refresh' },
    loadPrivateKey(),
    options
  );
}

// Interim token for 2FA — short 5 minute TTL
export function generateInterimToken(userId: string, email: string): string {
  const options: SignOptions = {
    algorithm: 'RS256',
    expiresIn: 5 * 60,
  };

  return jwt.sign(
    { sub: userId, email, type: 'interim' },
    loadPrivateKey(),
    options
  );
}

// ─── Token Verification ───────────────────────────────────────
export function verifyAccessToken(token: string): JwtPayload {
  try {
    const options: VerifyOptions = { algorithms: ['RS256'] };
    const payload = jwt.verify(token, loadPublicKey(), options) as JwtPayload;

    if (payload.type !== 'access') {
      throw new InvalidTokenError('access token');
    }

    return payload;
  } catch (err) {
    if (err instanceof InvalidTokenError) throw err;
    throw new InvalidTokenError('access token');
  }
}

export function verifyRefreshToken(token: string): JwtPayload {
  try {
    const options: VerifyOptions = { algorithms: ['RS256'] };
    const payload = jwt.verify(token, loadPublicKey(), options) as JwtPayload;

    if (payload.type !== 'refresh') {
      throw new InvalidTokenError('refresh token');
    }

    return payload;
  } catch (err) {
    if (err instanceof InvalidTokenError) throw err;
    throw new InvalidTokenError('refresh token');
  }
}

export function verifyInterimToken(token: string): { sub: string; email: string } {
  try {
    const options: VerifyOptions = { algorithms: ['RS256'] };
    const payload = jwt.verify(token, loadPublicKey(), options) as JwtPayload;

    if (payload.type !== 'interim') {
      throw new InvalidTokenError('interim token');
    }

    return { sub: payload.sub, email: payload.email };
  } catch (err) {
    if (err instanceof InvalidTokenError) throw err;
    throw new InvalidTokenError('interim token');
  }
}

// ─── Hash token for storage ───────────────────────────────────
import crypto from 'crypto';

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
