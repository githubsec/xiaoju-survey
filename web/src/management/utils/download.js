export const normalizeDownloadUrl = (url) => {
  if (!url) {
    return ''
  }

  try {
    return new URL(url, window.location.origin).href
  } catch (error) {
    return ''
  }
}

export const openDownloadUrl = (url, downloadWindow) => {
  const normalizedUrl = normalizeDownloadUrl(url)

  if (!normalizedUrl) {
    return false
  }

  if (downloadWindow && !downloadWindow.closed) {
    downloadWindow.location.href = normalizedUrl
    return true
  }

  const link = document.createElement('a')
  link.href = normalizedUrl
  link.target = '_blank'
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  return true
}
