export class AppError extends Error {
  public readonly code: string
  public readonly status: number
  public readonly requestId?: string

  constructor(message: string, options?: { code?: string; status?: number; requestId?: string }) {
    super(message)
    this.name = "AppError"
    this.code = options?.code ?? "internal_error"
    this.status = options?.status ?? 500
    this.requestId = options?.requestId
  }
}

export function userMessageFromError(error: unknown): string {
  if (error instanceof AppError) return error.message
  if (error instanceof Error) return error.message
  return "An unexpected error occurred. Please try again."
}

export function newRequestId(): string {
  return Math.random().toString(36).slice(2, 10)
}


