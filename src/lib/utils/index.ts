const isDevMode = import.meta.env.DEV;

export const log = (...args: any[]) => {
  if (!isDevMode) return;
  console.debug(...args);
};

/**
 * Extract key-value pairs from an HTML table string.
 * Key is taken from <th> elements and value from corresponding <td> elements.
 * @param html HTML table string
 * @returns Object with key-value pairs extracted from the table
 */
export const extractHtmlTable = (html: string): Record<string, any> => {
  const allPairsRegex = /<th>([^<]+)<\/th>\s*<td>([^<]+)<\/td>/g;

  const matches = [...html.matchAll(allPairsRegex)];
  const results: Record<string, string> = {};
  matches.forEach(([, key, value]) => {
    results[key] = value;
  });
  return results;
};