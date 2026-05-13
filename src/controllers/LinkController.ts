import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth';
import { z } from 'zod';

const linkSchema = z.object({
  name: z.string().min(1),
  baseUrl: z.string().url(),
  redirectUrl: z.string().url().optional(),
  projectId: z.string().uuid(),
  parameterIds: z.array(z.string().uuid()).optional(),
});

class LinkController {
  async create(req: AuthRequest, res: Response) {
    try {
      const { name, baseUrl, redirectUrl, projectId, parameterIds } = linkSchema.parse(req.body);
      const userId = req.userId!;

      // Verify project ownership
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId },
      });

      if (!project) {
        return res.status(403).json({ error: 'Project not found or access denied' });
      }

      const link = await prisma.link.create({
        data: {
          name,
          baseUrl,
          redirectUrl,
          projectId,
          parameters: {
            create: parameterIds?.map(id => ({
              parameter: { connect: { id } }
            }))
          }
        },
        include: { parameters: { include: { parameter: true } } }
      });

      return res.status(201).json(link);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid data or parameters' });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, baseUrl, redirectUrl, parameterIds } = linkSchema.partial().parse(req.body);
      const userId = req.userId!;

      const link = await prisma.link.findFirst({
        where: { id, project: { userId } }
      });

      if (!link) return res.status(404).json({ error: 'Link not found' });

      const updatedLink = await prisma.link.update({
        where: { id },
        data: {
          name,
          baseUrl,
          redirectUrl,
          parameters: parameterIds ? {
            deleteMany: {},
            create: parameterIds.map(pid => ({
              parameter: { connect: { id: pid } }
            }))
          } : undefined
        },
        include: { parameters: { include: { parameter: true } } }
      });

      return res.json(updatedLink);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid data' });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const userId = req.userId!;

    const link = await prisma.link.findFirst({
      where: { id, project: { userId } }
    });

    if (!link) return res.status(404).json({ error: 'Link not found' });

    await prisma.link.delete({ where: { id } });
    return res.status(204).send();
  }

  async generate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const link = await prisma.link.findUnique({
        where: { id },
        include: { parameters: { include: { parameter: true } } }
      });

      if (!link) return res.status(404).json({ error: 'Link not found' });

      const base = link.redirectUrl || link.baseUrl;
      const url = new URL(base);
      
      link.parameters.forEach(lp => {
        url.searchParams.append(lp.parameter.key, lp.parameter.value);
      });

      return res.json({ generatedUrl: url.toString() });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to generate link' });
    }
  }

  async listByProject(req: AuthRequest, res: Response) {
    const { projectId } = req.params;
    const userId = req.userId!;

    const links = await prisma.link.findMany({
      where: { projectId, project: { userId } },
      include: { parameters: { include: { parameter: true } } }
    });

    return res.json(links);
  }
}

export default new LinkController();
