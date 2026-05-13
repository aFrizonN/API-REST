import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

class UserController {
  async register(req: Request, res: Response) {
    try {
      const { email, password } = userSchema.parse(req.body);

      const userExists = await prisma.user.findUnique({ where: { email } });
      if (userExists) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      return res.status(201).json({ id: user.id, email: user.email });
    } catch (error) {
      return res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid data' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = userSchema.parse(req.body);

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '1d',
      });

      return res.json({ token, user: { id: user.id, email: user.email } });
    } catch (error) {
      return res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid data' });
    }
  }
}

export default new UserController();
