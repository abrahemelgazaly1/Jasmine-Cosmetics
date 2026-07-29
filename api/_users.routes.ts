import { Router } from 'express';
import { z } from 'zod';
import { User } from './_models';
import { auth } from './_middleware';

const router = Router();

const savedInfoSchema = z.object({
  fullName: z.string().optional().default(''),
  email: z.string().optional().default(''),
  governorate: z.string().optional().default(''),
  address: z.string().optional().default(''),
  phone1: z.string().optional().default(''),
  phone2: z.string().optional().default(''),
});

router.put('/saved-info', auth, async (req, res) => {
  const parsed = savedInfoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid input' });
    return;
  }
  const user = await User.findByIdAndUpdate(
    req.user!.id,
    { savedInfo: parsed.data },
    { new: true }
  ).select('savedInfo');
  res.json({ savedInfo: user?.savedInfo ?? null });
});

export default router;
