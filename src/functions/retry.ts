type RetryOptions = {
  retries?: number
  delay?: number
  onRetry?: (attempt: number, error: unknown) => void
}

export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { retries = 3, delay = 1000, onRetry = () => {} } = options

  let lastError: unknown

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      onRetry(attempt, err)

      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, delay))
      }
    }
  }

  throw lastError
}
