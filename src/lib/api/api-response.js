export class ApiRequestError extends Error {
  constructor(message, { code, status } = {}) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
    this.status = status;
  }
}

export async function requestData(request) {
  try {
    const response = await request;
    const body = response.data;
    if (!body?.success) {
      throw new ApiRequestError(body?.message || "요청 처리에 실패했습니다.", {
        code: body?.code,
        status: response.status,
      });
    }
    return body.data;
  } catch (error) {
    if (error instanceof ApiRequestError) throw error;
    const body = error.response?.data;
    throw new ApiRequestError(
      body?.message || "서버와 통신하지 못했습니다. 잠시 후 다시 시도해주세요.",
      { code: body?.code, status: error.response?.status },
    );
  }
}
