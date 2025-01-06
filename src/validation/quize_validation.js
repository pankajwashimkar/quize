const Joi = require('joi');

// Schema for quiz creation
const quizSchema = Joi.object({
  id: Joi.number().integer().required(),
  title: Joi.string().min(3).max(100).required(),
  questions: Joi.array().items(
    Joi.object({
      id: Joi.number().integer().required(),
      text: Joi.string().min(1).required(),
      options: Joi.array().items(Joi.string().required()).min(2).required(),
      correct_option: Joi.number().integer().required(),
    })
  ).min(1).required(),
});

// Schema for quiz submission
const submitQuizSchema = Joi.object({
  id: Joi.number().integer().required(),
  user_id: Joi.number().integer().required(),
  question_id: Joi.number().integer().required(),
  selected_option: Joi.number().integer().required(),
});

// Schema for parameters (quizId and userId)
const paramsSchema = Joi.object({
  quizId: Joi.number().integer().required(),
  userId: Joi.number().integer().required(),
});

module.exports = { quizSchema, submitQuizSchema, paramsSchema };
