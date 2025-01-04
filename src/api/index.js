const express = require('express');

const quize = require('./quize');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Hey welcome',
  });
});

router.use('/v1', quize);

module.exports = router;
