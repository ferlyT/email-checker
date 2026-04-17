/**
 * Service to parse container numbers from strings (e.g. email subjects)
 */
export class ParserService {
  /**
   * Extracts container numbers from a given text.
   * Format: 4 letters + 7 digits (e.g., ABCD1234567)
   */
  static parseContainerNumbers(text: string): string[] {
    const regex = /[A-Z]{4}\d{7}/g;
    const matches = text.match(regex);
    
    if (!matches) return [];
    
    // Remove duplicates
    return Array.from(new Set(matches.map(m => m.toUpperCase())));
  }
}
