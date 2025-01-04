const express = require('express');

const router = express.Router();
// In-memory storage for quizzes and results
let quizzes = [];
let results = [];

// Helper function to find a quiz by ID
const findQuizById = (id) => quizzes.find(quiz => quiz.id === id);

router.post('/quizzes', (req, res) => {
  try {
    let { id, title, questions } = req.body;
    let quize = { id, title, questions };
    quizzes.push(quize);
    res.status(201).json({ quizzes });
  } catch (error) {
    res.status(500).json({ "message": "Internal Server Error" });
  }
});

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

router.post('/quizzes/submit', (req, res) => {
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

router.post('/results/:quizId/:userId', (req, res) => {
  try {
    const quizId = parseInt(req.params.quizId);
    const userId = parseInt(req.params.userId);
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
