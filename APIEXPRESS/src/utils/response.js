const response = (res, statusCode, success, message, data = null) => {
  const responseObj = { success };
  if (message) responseObj.message = message;
  if (data !== null) responseObj.data = data;
  return res.status(statusCode).json(responseObj);
};

const success = (res, message, data) => response(res, 200, true, message, data);
const created = (res, message, data) => response(res, 201, true, message, data);
const error = (res, statusCode, code, message) => {
  return res.status(statusCode).json({
    success: false,
    error: { code, message }
  });
};

module.exports = { response, success, created, error };