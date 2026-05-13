import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth';
import { z } from 'zod';

const projectSchema = z.object({
  name: z.string().min(1),
});

class ProjectController {
  async create(req: AuthRequest, res: Response) {
    try {
      const { name } = projectSchema.parse(req.body);
      const userId = req.userId!;

      const project = await prisma.project.create({
        data: {
          name,
          userId,
        },
      });

      return res.status(201).json(project);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid data' });
    }
  }

  async list(req: AuthRequest, res: Response) {
    const userId = req.userId!;
    const projects = await prisma.project.findMany({
      where: { userId },
      include: { _count: { select: { links: true } } },
    });

    return res.json(projects);
  }
}

export default new ProjectController();
