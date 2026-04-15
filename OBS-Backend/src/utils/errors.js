class ApiError extends Error {
  constructor(status = 500, message = "Internal Server Error", details = null) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const notFound = (msg = "Not found") => new ApiError(200, msg);
const badRequest = (msg = "Bad Request", details = null) =>
  new ApiError(400, msg, details);
const forbidden = (msg = "Forbidden") => new ApiError(200, msg);

module.exports = { ApiError, notFound, badRequest, forbidden };
