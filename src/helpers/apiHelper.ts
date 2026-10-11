const TOKEN_KEY = 'delcom_cash_flow_token'

export interface ApiResponse<T = unknown> {
  status: string
  message: string
  data: T
}

export interface RequestOptions {
  method?: string
  body?: unknown
  formData?: FormData
  query?: Record<string, string | number | null | undefined>
  auth?: boolean
}

export class ApiError extends Error {
  data: unknown

  constructor(message: string, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.data = data
  }
}

export function getAccessToken(): string | null {
  if (typeof localStorage === 'undefined') return null

  return localStorage.getItem(TOKEN_KEY)
}

export function putAccessToken(token: string | null): void {
  if (typeof localStorage === 'undefined') return

  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Terjadi kesalahan tak terduga'
}

function buildUrl(
  path: string,
  query?: RequestOptions['query'],
): string {
  const baseURL = DELCOM_BASEURL.replace(/\/+$/, '')
  const normalizedPath = path.replace(/^\/+/, '')
  const url = new URL(`${baseURL}/${normalizedPath}`)

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  return url.toString()
}

function extractMessage(
  json: ApiResponse<unknown> | null,
): string {
  if (!json) return 'Respon server tidak valid'

  const data = json.data

  if (data && typeof data === 'object') {
    const details = Object.values(data)
      .flatMap((value) => Array.isArray(value) ? value : [value])
      .filter(
        (value): value is string =>
          typeof value === 'string' && value.length > 0,
      )
      .join(', ')

    if (details) {
      return `${json.message || 'Permintaan gagal'}: ${details}`
    }
  }

  return json.message || 'Permintaan gagal diproses'
}

/**
 * Wrapper fetch API Delcom.
 * Menangani query, JSON, FormData, token Bearer, dan error.
 */
export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    body,
    formData,
    query,
    auth = true,
  } = options

  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  const token = auth ? getAccessToken() : null

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let payload: BodyInit | undefined

  if (formData) {
    payload = formData
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let response: Response

  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: payload,
    })
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server')
  }

  const json = (
    await response.json().catch(() => null)
  ) as ApiResponse<T> | null

  if (!response.ok || !json || json.status !== 'success') {
    throw new ApiError(extractMessage(json), json?.data)
  }

  return json
}
