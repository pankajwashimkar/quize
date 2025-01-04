const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/app');
describe('Quiz API Tests', () => {
  describe('POST /api/quizzes', () => {
    it('should create a new quiz', async () => {
      const quiz = {
        id: 1,
        title: 'Sample Quiz',
        questions: [
          { id: 1, question: 'What is 2+2?', options: [2, 3, 4, 5], correct_option: 4 },
        ],
      };

      const res = await request(app).post('/api/v1/quizzes').send(quiz);
      expect(res.status).to.equal(201);
      expect(res.body.quizzes).to.be.an('array');
      expect(res.body.quizzes[0].title).to.equal('Sample Quiz');
    });
    });
  });


  describe('GET /api/v1/quizzes/:id', () => {
    it('should retrieve a quiz by ID without the correct_option in questions', async () => {
      const res = await request(app).get('/api/v1/quizzes/1');
      expect(res.status).to.equal(200);
      expect(res.body.quiz).to.have.property('id', 1);
      expect(res.body.quiz.questions[0]).to.not.have.property('correct_option');
    });

    it('should return 500 for a non-existing quiz', async () => {
      const res = await request(app).get('/api/v1/quizzes/999');
      expect(res.status).to.equal(500);
      expect(res.body.message).to.equal('Internal Server Error');
    });
  });

  describe('POST /api/v1/quizzes/submit', () => {
    it('should submit a quiz answer and return the result', async () => {
      const submission = {
        id: 1,
        user_id: 1,
        question_id: 1,
        selected_option: 4,
      };

      const res = await request(app).post('/api/v1/quizzes/submit').send(submission);
      expect(res.status).to.equal(200);
      console.log(res.body);
      expect(res.body).to.have.property('is_correct').that.is.oneOf([true, false]);
    });

    it('should return 404 if the quiz does not exist', async () => {
      const submission = {
        id: 999,
        user_id: 1,
        question_id: 1,
        selected_option: 4,
      };

      const res = await request(app).post('/api/v1/quizzes/submit').send(submission);
      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal('Quize not found');
    });
  });

  describe('POST /api/v1/results/:quizId/:userId', () => {
    it('should retrieve the results of a quiz for a user', async () => {
      const res = await request(app).post('/api/v1/results/1/1');
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('score');
      expect(res.body).to.have.property('answers').that.is.an('array');
    });

    it('should return 404 if no results are found for the user', async () => {
      const res = await request(app).post('/api/v1/results/999/1');
      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal('Results not found');
    });
  });
