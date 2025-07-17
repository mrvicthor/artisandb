import { logger } from '@/lib/winston';
import { ClientModel, ClientProfile } from '@/models/client.model';
import { clientProfileSchema } from '@/validation/schema';
import { NextFunction, Request, Response } from 'express';

type CreateClientInput = Omit<ClientProfile, 'id'>;
const createClient = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const clientData = req.body as CreateClientInput;
    const validatedData = clientProfileSchema.parse(clientData);
    if (!validatedData) {
      next({
        status: 400,
        code: 'InvalidClientData',
        message: 'Client data is invalid',
      });
      return;
    }
    const newClient = await ClientModel.create(validatedData);
    logger.info(`New client created with ID: ${newClient.id}`, {
      userId: newClient.user_id,
    });
    res.status(201).json({
      message: 'Client profile created successfully',
      client: {
        id: newClient.id,
        user_id: newClient.user_id,
      },
    });
    // Assuming you have a body parser middleware
  } catch (error) {
    next(error);
  }
};
export default createClient;
