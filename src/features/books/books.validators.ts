import Joi from 'joi';

export const CreateBookValidator = Joi.object({
  title: Joi.string().required(),
  author: Joi.string().required(),
  originalTitle: Joi.string().optional(),
  seriesId: Joi.number().integer().optional(),
  seriesOrder: Joi.number().integer().optional(),
  coverUrl: Joi.string().uri().optional(),
});
