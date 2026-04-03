import Joi from 'joi';

const FORMAT_VALUES = ['Digital', 'Hardcover', 'Paperback'];

export const CreateEditionValidator = Joi.object({
  bookId: Joi.number().integer().required(),
  name: Joi.string().required(),
  publisher: Joi.string().allow('').optional(),
  publicationDate: Joi.string().allow('').optional(),
  isbn: Joi.string().allow('').optional(),
  format: Joi.string()
    .valid(...FORMAT_VALUES)
    .optional(),
  language: Joi.string().allow('').optional(),
});

export const UpdateEditionValidator = Joi.object({
  name: Joi.string().optional(),
  publisher: Joi.string().allow('').optional(),
  publicationDate: Joi.string().allow('').optional(),
  isbn: Joi.string().allow('').optional(),
  format: Joi.string()
    .valid(...FORMAT_VALUES)
    .optional(),
  language: Joi.string().allow('').optional(),
});
