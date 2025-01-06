function notFound(req, res, next) {
  res.status(404);
  const error = new Error(`Requested URL Not Found - ${req.originalUrl}`);
  next(error);
}

/* eslint-disable no-unused-vars */
function errorHandler(err, req, res, next) {
  /* eslint-enable no-unused-vars */
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: err.stack,
  });
}

// Validation middleware
const validate = (schema, property = 'body') => (req, res, next) => {
  const { error } = schema.validate(req[property], { abortEarly: false });
  if (error) {
    return res.status(400).json({ errors: error.details.map(err => err.message) });
  }
  next();
};

module.exports = {
  notFound,
  errorHandler,
  validate
};
