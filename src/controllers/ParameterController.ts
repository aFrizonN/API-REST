import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';

const parameterSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
});

class ParameterController {
  async create(req: Request, res: Response) {
    try {
      const { key, value } = parameterSchema.parse(req.body);

      const parameter = await prisma.parameter.create({
        data: { key, value }
      });

      return res.status(201).json(parameter);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid data' });
    }
  }

  async list(req: Request, res: Response) {
    const parameters = await prisma.parameter.findMany();
    return res.json(parameters);
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { key, value } = parameterSchema.parse(req.body);

      const parameter = await prisma.parameter.update({
        where: { id },
        data: { key, value }
      });

      return res.json(parameter);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid data' });
    }
  }
}

export default new ParameterController();
