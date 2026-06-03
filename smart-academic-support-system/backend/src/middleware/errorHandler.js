export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const message = err.name === "ValidationError" ? Object.values(err.errors).map((e) => e.message).join(", ") : err.message;

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
};
