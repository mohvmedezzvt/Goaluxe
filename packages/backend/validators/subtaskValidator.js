import Joi from 'joi';

export const createSubtaskSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).required().messages({
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 3 characters long',
    'any.required': 'Title is required',
  }),
  description: Joi.string().trim().optional().allow(''),
  dueDate: Joi.date().optional().allow(null),
});

export const updateSubtaskSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).optional(),
  description: Joi.string().trim().optional().allow(''),
  status: Joi.string().valid('pending', 'in-progress', 'completed').optional(),
  dueDate: Joi.date().optional().allow(null),
}).min(1); // At least one field must be provided for update.
