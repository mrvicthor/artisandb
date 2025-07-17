import { logger } from '@/lib/winston';
import { ClientModel } from '@/models/client.model';
import { updateClientSchema } from '@/validation/schema';
import { NextFunction, Request, Response } from 'express';

const updateClient = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.params.id;
    const data = req.body;
    if (!userId || !data) {
      next({
        status: 400,
        code: 'InvalidInput',
        message: 'User ID and data are required for updating client profile',
      });
      return;
    }
    const validatedData = updateClientSchema.parse(data);
    if (!validatedData) {
      next({
        status: 400,
        code: 'InvalidClientData',
        message: 'Client data is invalid',
      });
      return;
    }

    const updatedClient = await ClientModel.updateClient(userId, data);
    logger.info(`Client profile updated for user ID: ${userId}`, {
      userId: updatedClient.user_id,
    });

    res.status(200).json({
      message: 'Client profile updated successfully',
      data: updatedClient,
    });
  } catch (error) {
    next(error);
  }
};

export default updateClient;
