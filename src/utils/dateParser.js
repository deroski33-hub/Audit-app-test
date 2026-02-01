/**
 * Date Parser Utility
 * Handles multiple date formats with priority for DD/MM/YYYY (European format)
 */

/**
 * Supported date formats in order of priority
 * DD/MM/YYYY is prioritized as the primary format for audit documents
 */
const DATE_FORMATS = [
  { regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, format: 'DD/MM/YYYY', parser: parseDDMMYYYY },
  { regex: /^(\d{1,2})-(\d{1,2})-(\d{4})$/, format: 'DD-MM-YYYY', parser: parseDDMMYYYY },
  { regex: /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/, format: 'DD.MM.YYYY', parser: parseDDMMYYYY },
  { regex: /^(\d{4})-(\d{1,2})-(\d{1,2})$/, format: 'YYYY-MM-DD', parser: parseYYYYMMDD },
  { regex: /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/, format: 'YYYY/MM/DD', parser: parseYYYYMMDD },
  { regex: /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})$/i, format: 'DD Mon YYYY', parser: parseDDMonYYYY },
  { regex: /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})$/i, format: 'Mon DD, YYYY', parser: parseMonDDYYYY },
];

const MONTH_NAMES = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
};

/**
 * Parse DD/MM/YYYY format (European/UK format)
 * This is the PRIMARY format for audit documents
 */
function parseDDMMYYYY(match) {
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1; // JS months are 0-indexed
  const year = parseInt(match[3], 10);

  if (!isValidDate(day, month, year)) {
    return null;
  }

  return new Date(year, month, day);
}

/**
 * Parse YYYY-MM-DD format (ISO format)
 */
function parseYYYYMMDD(match) {
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);

  if (!isValidDate(day, month, year)) {
    return null;
  }

  return new Date(year, month, day);
}

/**
 * Parse DD Mon YYYY format (e.g., "15 January 2024")
 */
function parseDDMonYYYY(match) {
  const day = parseInt(match[1], 10);
  const monthStr = match[2].toLowerCase().substring(0, 3);
  const year = parseInt(match[3], 10);
  const month = MONTH_NAMES[monthStr];

  if (month === undefined || !isValidDate(day, month, year)) {
    return null;
  }

  return new Date(year, month, day);
}

/**
 * Parse Mon DD, YYYY format (e.g., "January 15, 2024")
 */
function parseMonDDYYYY(match) {
  const monthStr = match[1].toLowerCase().substring(0, 3);
  const day = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  const month = MONTH_NAMES[monthStr];

  if (month === undefined || !isValidDate(day, month, year)) {
    return null;
  }

  return new Date(year, month, day);
}

/**
 * Validate date components
 */
function isValidDate(day, month, year) {
  if (month < 0 || month > 11) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > 2100) return false;

  // Check days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return day <= daysInMonth;
}

/**
 * Parse a date string with automatic format detection
 * Prioritizes DD/MM/YYYY format for audit documents
 *
 * @param {string} dateString - The date string to parse
 * @param {string} preferredFormat - Optional preferred format hint
 * @returns {object} - { date: Date|null, format: string|null, original: string }
 */
export function parseDate(dateString, preferredFormat = 'DD/MM/YYYY') {
  if (!dateString || typeof dateString !== 'string') {
    return { date: null, format: null, original: dateString, error: 'Invalid input' };
  }

  const trimmed = dateString.trim();

  // Try each format in order
  for (const { regex, format, parser } of DATE_FORMATS) {
    const match = trimmed.match(regex);
    if (match) {
      const date = parser(match);
      if (date) {
        return {
          date,
          format,
          original: trimmed,
          formatted: formatDate(date, 'DD/MM/YYYY'),
          iso: date.toISOString().split('T')[0]
        };
      }
    }
  }

  // Try native Date parsing as fallback
  const nativeDate = new Date(trimmed);
  if (!isNaN(nativeDate.getTime())) {
    return {
      date: nativeDate,
      format: 'native',
      original: trimmed,
      formatted: formatDate(nativeDate, 'DD/MM/YYYY'),
      iso: nativeDate.toISOString().split('T')[0],
      warning: 'Parsed using native Date - format may be ambiguous'
    };
  }

  return { date: null, format: null, original: trimmed, error: 'Unable to parse date' };
}

/**
 * Format a Date object to the specified format
 *
 * @param {Date} date - The Date object to format
 * @param {string} format - The output format (default: DD/MM/YYYY)
 * @returns {string} - Formatted date string
 */
export function formatDate(date, format = 'DD/MM/YYYY') {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`;
    case 'DD.MM.YYYY':
      return `${day}.${month}.${year}`;
    default:
      return `${day}/${month}/${year}`;
  }
}

/**
 * Parse multiple dates from text
 *
 * @param {string} text - Text containing dates
 * @returns {Array} - Array of parsed date results
 */
export function extractDates(text) {
  if (!text) return [];

  // Common date patterns
  const patterns = [
    /\b(\d{1,2}\/\d{1,2}\/\d{4})\b/g,
    /\b(\d{1,2}-\d{1,2}-\d{4})\b/g,
    /\b(\d{1,2}\.\d{1,2}\.\d{4})\b/g,
    /\b(\d{4}-\d{1,2}-\d{1,2})\b/g,
    /\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\b/gi,
  ];

  const found = new Set();
  const results = [];

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (!found.has(match[1])) {
        found.add(match[1]);
        results.push(parseDate(match[1]));
      }
    }
  }

  return results;
}

/**
 * Convert ambiguous date (could be DD/MM or MM/DD)
 * Always interprets as DD/MM/YYYY for consistency
 *
 * @param {string} dateString - Ambiguous date like "01/02/2024"
 * @returns {object} - Parsed as DD/MM/YYYY
 */
export function parseAsEuropeanDate(dateString) {
  return parseDate(dateString, 'DD/MM/YYYY');
}

export default {
  parseDate,
  formatDate,
  extractDates,
  parseAsEuropeanDate
};
