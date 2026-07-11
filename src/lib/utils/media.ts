const apiBaseUrl =
  import.meta.env.VITE_API_URL?.trim() || 'http://localhost:8000/api'

function getMediaOrigin() {
  return apiBaseUrl.replace(/\/api\/?$/, '')
}

export function getMediaUrl(path: string | null | undefined): string | null {
  if (!path) {
    return null
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  return `${getMediaOrigin()}/media/${path.replace(/^\//, '')}`
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
