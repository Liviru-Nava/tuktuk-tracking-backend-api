// Standardised API response format for all endpoints.

//success response format
export const sendSuccess = (response, statusCode, message, data = null) => {
    const body = { success: true, message };
    if (data !== null) body.data = data;
    return response.status(statusCode).json(body);
};

//error response format
export const sendError = (response, statusCode, message, errors = null) => {
    const body = { success: false, message };
    if (errors !== null) body.errors = errors;
    return response.status(statusCode).json(body);
};

//collection response format for most GETs
export const sendCollection = (res, statusCode, message, collection) => {
  return res.status(statusCode).json({
    success: true,
    message,
    collection,
  });
};
