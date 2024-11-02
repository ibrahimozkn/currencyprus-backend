export function cleanWebsiteString(website: string): string {
  return website
    .replace(/^(https?:\/\/)?(www\.)?/, '')
    .split('/')[0]
    .replace(/\./g, '_');
}
