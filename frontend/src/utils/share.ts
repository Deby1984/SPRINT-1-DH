export type ShareNetwork = 'facebook' | 'x' | 'instagram'

export type ProductShareMetadata = {
  title: string
  description: string
  image: string
  url: string
}

export function socialShareUrl(network: ShareNetwork, url: string, message: string) {
  if (network === 'facebook') {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  }
  if (network === 'x') {
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(message.trim())}&url=${encodeURIComponent(url)}`
  }
  return 'https://www.instagram.com/'
}

export function defaultShareMessage(productName: string) {
  return `Mirá ${productName} en Horizonte.`
}

export function shareText(message: string, url: string) {
  return `${message.trim()} ${url}`.trim()
}

export function productShareMetadata(
  productName: string,
  description: string,
  image: string,
  url: string,
): ProductShareMetadata {
  return {
    title: `${productName.trim()} | Horizonte`,
    description: description.trim(),
    image,
    url,
  }
}
