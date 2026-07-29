import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User.js';
import { signToken, auth } from '../middleware/auth.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });
    return;
  }
  const { name, email, password } = parsed.data;
  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ message: 'Email already registered' });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  const token = signToken({ id: user.id, role: user.role });
  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid input' });
    return;
  }
  const { email, password } = parsed.data;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }
  const token = signToken({ id: user.id, role: user.role });
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user!.id).select('name email role savedInfo');
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      savedInfo: user.savedInfo ?? null,
    },
  });
});

export default router;
