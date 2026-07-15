const isDev = import.meta.env.DEV;

export const logger = {
  error: (error: unknown, context?: Record<string, unknown>) => {
    if (isDev) {
      console.error(error, context);
    } else {
      // send to monitoring service
    }
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    if (isDev) console.warn(message, context);
  },
};
  