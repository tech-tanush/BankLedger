function errorHandler(err, req, res, next) {
  // If response has already started sending, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  console.error("Unhandled Application Error:", err);

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(409).json({
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      message: messages.join(", "),
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      message: `Invalid ID format for ${err.path}`,
    });
  }

  // JWT error
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      message: "Invalid or expired authorization token",
    });
  }

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    message: err.message || "An unexpected error occurred",
  });
}

function notFoundHandler(req, res) {
  return res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};

