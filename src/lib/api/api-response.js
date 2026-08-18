export class ApiRequestError extends Error {
  constructor(message, { code, status, errors } = {}) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
    this.status = status;
    this.errors = errors;
  }
}

function extractErrorMessage(body) {
  if (!body) return "서버와 통신하지 못했습니다. 잠시 후 다시 시도해주세요.";
  if (Array.isArray(body.errors) && body.errors.length > 0) {
    const details = body.errors
      .map((e) => e.reason || e.message || (e.field ? `${e.field}: ${e.defaultMessage || e.reason}` : JSON.stringify(e)))
      .join(", ");
    return `${body.message || "입력값이 올바르지 않습니다."} (${details})`;
  }
  if (typeof body.errors === "object" && body.errors !== null && Object.keys(body.errors).length > 0) {
    const details = Object.entries(body.errors)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    return `${body.message || "입력값이 올바르지 않습니다."} (${details})`;
  }
  return body.message || "요청 처리에 실패했습니다.";
}

export async function requestData(request) {
  try {
    const response = await request;
    const body = response.data;
    
    // If backend explicitly marked failure or status is an error code
    if (body?.success === false || (body?.status && Number(body.status) >= 400)) {
      throw new ApiRequestError(extractErrorMessage(body), {
        code: body?.code,
        status: body?.status || response.status,
        errors: body?.errors,
      });
    }

    // Return data property if available, otherwise return whole body
    return body?.data !== undefined ? body.data : body;
  } catch (error) {
    if (error instanceof ApiRequestError) throw error;
    const body = error.response?.data;
    throw new ApiRequestError(
      extractErrorMessage(body),
      { code: body?.code, status: error.response?.status, errors: body?.errors },
    );
  }
}
