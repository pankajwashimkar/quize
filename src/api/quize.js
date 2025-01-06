const express = require('express');
const { validate } = require('../middleware/middlewares.js');
const { quizSchema, submitQuizSchema, paramsSchema } = require('../validation/quize_validation.js');
const router = express.Router();
// In-memory storage for quizzes and results
let quizzes = [];
let results = [];

// Helper function to find a quiz by ID
const findQuizById = (id) => quizzes.find(quiz => quiz.id === id);
/**
 * @swagger
 * /quizzes:
 *   post:
 *     summary: Create a new quiz
 *     tags: [Quizzes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             id: 1
 *             title: "Sample Quiz"
 *             questions:
 *               - id: 1
 *                 text: "What is the capital of France?"
 *                 options: ["Paris", "Berlin", "Madrid","Delhi"]
 *                 correct_option: 0
 *     responses:
 *       201:
 *         description: Quiz created successfully
 *         content:
 *           application/json:
 *             example:
 *               quizzes:
 *                 - id: 1
 *                   title: "Sample Quiz"
 *                   questions:
 *                     - id: 1
 *                       text: "What is the capital of France?"
 *                       options: ["Paris", "Berlin", "Madrid","Delhi"]
 *                       correct_option: 0
 *       500:
 *         description: Internal Server Error
 */
router.post('/quizzes', validate(quizSchema), (req, res) => {
  try {
    let { id, title, questions } = req.body;
    let quize = { id, title, questions };
    quizzes.push(quize);
    res.status(201).json({ quizzes });
  } catch (error) {
    res.status(500).json({ "message": "Internal Server Error" });
  }
});
/**
 * @swagger
 * /quizzes/{id}:
 *   get:
 *     summary: Get a quiz by ID
 *     tags: [Quizzes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The quiz ID
 *     responses:
 *       200:
 *         description: Quiz retrieved successfully
 *       404:
 *         description: Quiz not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/quizzes/:id', (req, res) => {
  try {
    const quizId = parseInt(req.params.id);
    const quiz = findQuizById(quizId);
    quiz.questions.map(data => {
      delete data.correct_option;
    });
    if (!quiz) {
      return res.status(404).json({ "message": "Quize not found" })
    }
    res.status(200).json({ quiz });
  } catch (error) {
    res.status(500).json({ "message": "Internal Server Error" });
  }
});
/**
 * @swagger
 * /quizzes/submit:
 *   post:
 *     summary: Submit a quiz answer
 *     tags: [Quizzes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             id: 1
 *             user_id: 1
 *             question_id: 1
 *             selected_option: 0
 *     responses:
 *       200:
 *         description: Answer submitted successfully
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               user_id: 1
 *               question_id: 1
 *               selected_option: 0
 *       404:
 *         description: Quiz or question not found
 *       500:
 *         description: Internal Server Error
 */
router.post('/quizzes/submit', validate(submitQuizSchema), (req, res) => {
  try {
    let { id, user_id, question_id, selected_option } = req.body;
    const quiz = findQuizById(id);
    if (!quiz) {
      return res.status(404).json({ "message": "Quize not found" })
    }

    let answerDeatails = quiz.questions.find(x => x.id == question_id);
    if (!answerDeatails) {
      return null;
    }
    let isCorrect = (answerDeatails.correct_option === selected_option);
    let details = {
      user_id,
      question_id: question_id,
      selected_option: selected_option,
      is_correct: isCorrect,
      correct_option: answerDeatails.correct_option,
      quiz_id: quiz.id
    };

    results.push(details);
    res.status(200).json(details);
  } catch (error) {
    res.status(500).json({ "message": "Internal Server Error" });
  }
});
/**
 * @swagger
 * /results:
 *   post:
 *     summary: Get results for a user on a specific quiz
 *     tags: [Results]
 *     parameters:
 *       - in: query
 *         name: quizId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The quiz ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 quizId:
 *                   type: integer
 *                 userId:
 *                   type: integer
 *                 score:
 *                   type: integer
 *                 answers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       selected_option:
 *                         type: string
 *                       correct_option:
 *                         type: string
 *                       is_correct:
 *                         type: boolean
 *       404:
 *         description: Results not found
 *       500:
 *         description: Internal Server Error
 */
router.post('/results', validate(paramsSchema, 'query'), (req, res) => {
  try {
    const quizId = parseInt(req.query.quizId);
    const userId = parseInt(req.query.userId);
    let score = 0;
    const userResults = results.filter(result => result.quiz_id === quizId && result.user_id === userId);
    let answers = [];
    userResults.map((data) => {
      if (data.is_correct) {
        score++
      }
      answers.push({
        selected_option: data.selected_option,
        correct_option: data.correct_option,
        is_correct: data.is_correct
      });
    });
    if (userResults.length === 0) {
      return res.status(404).json({ message: 'Results not found' });
    }
    let response = {
      quizId, userId, score, answers
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ "message": "Internal Server Error" });
  }
});

module.exports = router;
