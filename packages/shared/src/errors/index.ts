export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number,
    public details?: Record<string, string>
  ) {
    super(message);
    this.name = "AppError";
  }
}
