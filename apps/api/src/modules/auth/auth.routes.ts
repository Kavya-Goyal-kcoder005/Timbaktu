import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { registerSchema, loginSchema } from '@timbaktu/shared';
import { UserModel } from '../../models/User';
import { generateToken, setAuthCookie, clearAuthCookie } from '../../utils/token';
import { requireAuth } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

const router = Router();

// POST /api/v1/auth/register
router.post('/register', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = registerSchema.parse(req.body);
    const normalizedUsername = validated.username.toLowerCase();
    const normalizedEmail = validated.email.toLowerCase();

    // Check for existing user by username or email
    const existingUser = await UserModel.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    });

    if (existingUser) {
      if (existingUser.username === normalizedUsername) {
        throw new AppError('This username is already taken. Please choose another.', 409, 'USERNAME_TAKEN');
      }
      throw new AppError('An account with this email address already exists.', 409, 'EMAIL_EXISTS');
    }

    // Hash password with 12 rounds of bcrypt
    const passwordHash = await bcrypt.hash(validated.password, 12);

    const newUser = await UserModel.create({
      username: normalizedUsername,
      email: normalizedEmail,
      displayName: validated.displayName,
      passwordHash,
    });

    const token = generateToken({
      userId: newUser._id.toString(),
      username: newUser.username,
      email: newUser.email,
    });

    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      data: newUser.toAuthJSON(),
      token, // Also return token for headless API clients
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = loginSchema.parse(req.body);
    const loginIdentifier = validated.login.toLowerCase();

    const user = await UserModel.findOne({
      $or: [{ username: loginIdentifier }, { email: loginIdentifier }],
    });

    if (!user) {
      throw new AppError('Invalid username/email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const isValidPassword = await user.comparePassword(validated.password);
    if (!isValidPassword) {
      throw new AppError('Invalid username/email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
    });

    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      data: user.toAuthJSON(),
      token,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/logout
router.post('/logout', (req: Request, res: Response): void => {
  clearAuthCookie(res);
  res.status(200).json({
    success: true,
    message: 'Signed out successfully.',
  });
});

// GET /api/v1/auth/me
router.get('/me', requireAuth, (req: Request, res: Response): void => {
  if (!req.user) {
    throw new AppError('User not authenticated.', 401, 'UNAUTHORIZED');
  }
  res.status(200).json({
    success: true,
    data: req.user.toAuthJSON(),
  });
});

export const authRouter = router;
