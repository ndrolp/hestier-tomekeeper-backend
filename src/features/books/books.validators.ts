import Joi from 'joi';

export const CreateBookValidator = Joi.object({
  title: Joi.string().required(),
  authorNames: Joi.array().items(Joi.string()).optional(),
  originalTitle: Joi.string().optional(),
  seriesId: Joi.number().integer().optional(),
  seriesOrder: Joi.number().integer().optional(),
  coverUrl: Joi.string().uri().optional(),
  description: Joi.string().optional(),
  edition: Joi.object({
    name: Joi.string().allow('').optional(),
    publisher: Joi.string().allow('').optional(),
    publicationDate: Joi.string().allow('').optional(),
    isbn: Joi.string().allow('').optional(),
    format: Joi.string().valid('Digital', 'Hardcover', 'Paperback').optional(),
    language: Joi.string().allow('').optional(),
  }).optional(),
});

export const UpdateBookValidator = Joi.object({
  title: Joi.string().optional(),
  originalTitle: Joi.string().allow('', null).optional(),
  seriesId: Joi.number().integer().allow(null).optional(),
  seriesName: Joi.string().allow('', null).optional(),
  seriesOrder: Joi.number().integer().allow(null).optional(),
  coverUrl: Joi.string().uri().allow('', null).optional(),
  description: Joi.string().allow('', null).optional(),
  authorNames: Joi.array().items(Joi.string()).optional(),
});

export const ImportBookValidator = Joi.object({
  title: Joi.string().required(),
  authorNames: Joi.array().items(Joi.string()).optional(),
  originalTitle: Joi.string().allow('').optional(),
  seriesId: Joi.number().integer().optional(),
  seriesName: Joi.string().allow('').optional(),
  seriesOrder: Joi.number().integer().allow(null).optional(),
  coverUrl: Joi.string().uri().optional().allow(''),
  description: Joi.string().allow('').optional(),
  edition: Joi.object({
    name: Joi.string().allow('').optional(),
    publisher: Joi.string().allow('').optional(),
    publicationDate: Joi.string().allow('').optional(),
    isbn: Joi.string().allow('').optional(),
    format: Joi.string().valid('Digital', 'Hardcover', 'Paperback').optional(),
    language: Joi.string().allow('').optional(),
  }).optional(),
});
