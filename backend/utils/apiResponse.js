// Consistent success envelope for every endpoint: { success, message, data?, meta? }
export const sendSuccess = (res, statusCode, message, data = null, meta = null) => {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  if (meta !== null) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

// Throw `new ApiError(400, 'message')` from anywhere inside an asyncHandler-wrapped
// controller and the global error middleware will format it correctly.
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}
