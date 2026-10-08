import { ApiError } from './api-error';
import { createApiUrl } from './config';

type ApiRequestOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
};

type PublicErrorPayload = {
  error?: {
    code?: unknown;
    message?: unknown;
  };
};

const unexpectedResponseMessage = 'No pudimos procesar la respuesta del servidor.';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

async function readJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    throw new ApiError(response.status, 'UNEXPECTED_RESPONSE', unexpectedResponseMessage);
  }

  try {
    return await response.json();
  } catch {
    throw new ApiError(response.status, 'UNEXPECTED_RESPONSE', unexpectedResponseMessage);
  }
}

function toApiError(status: number, payload: unknown): ApiError {
  if (isRecord(payload) && isRecord(payload.error)) {
    const publicError = payload as PublicErrorPayload;
    const code = publicError.error?.code;
    const message = publicError.error?.message;

    if (typeof code === 'string' && typeof message === 'string') {
      return new ApiError(status, code, message);
    }
  }

  return new ApiError(status, 'UNEXPECTED_RESPONSE', unexpectedResponseMessage);
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(createApiUrl(path), {
      method: options.method ?? 'GET',
      credentials: 'include',
      headers: options.body === undefined ? undefined : { 'content-type': 'application/json' },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'No pudimos comunicarnos con el servidor.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await readJson(response);

  if (!response.ok) {
    throw toApiError(response.status, payload);
  }

  return payload as T;
}
