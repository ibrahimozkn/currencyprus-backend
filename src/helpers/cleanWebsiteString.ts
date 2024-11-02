export function cleanWebsiteString(website: string): string {
  const cleanUrl = website.replace(/^(https?:\/\/)?(www\.)?/, '');

  return cleanUrl.split('/')[0];
}
