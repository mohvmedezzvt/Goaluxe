import Joi from 'joi';

export const goalCreateSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    'string.empty': 'Title is required'
  }),
  description: Joi.string().trim().optional().allow(''),
  dueDate: Joi.date().optional().allow(null),
  rewardOptionId: Joi.string().trim().optional(),  // if using reward references
  progress: Joi.number().optional(),
  status: Joi.string().valid('active', 'completed', 'cancelled').optional(),
});

export const goalUpdateSchema = Joi.object({
  title: Joi.string().trim().optional(),
  description: Joi.string().trim().optional(),
  dueDate: Joi.date().optional().allow(null),
  rewardOptionId: Joi.string().trim().optional(),
  progress: Joi.number().optional(),
  status: Joi.string().valid('active', 'completed', 'cancelled').optional(),
}).min(1); // At least one field must be provided for update
