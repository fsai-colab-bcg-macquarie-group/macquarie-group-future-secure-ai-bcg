export async function formatInput(term: string): Promise<string> {
  // Ensure term is a string and trim to remove spaces at the beginning/end
  const termString = String(term || '')
  const value = termString.trim()

  // Check special cases that should return an empty string
  if (!value || value === '@') {
    return ''
  }

  // Block characters that are not allowed like "/"
  if (value.includes('/')) {
    return ''
  }

  // Check if there is still content after removing non-alphanumeric characters
  const words = value.split(/[^A-Za-zÀ-ÿ\s.]+/).filter(Boolean)
  if (words.length === 0) {
    return ''
  }

  // Join the words and normalize spaces (replace multiple spaces with a single one)
  const result = words.join('')

  // Ensure the return is always a string, even if empty
  const finalResult = result?.replace(/\s+/g, ' ') || ''
  return finalResult
}
