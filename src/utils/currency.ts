/**
 * Currency utility functions for formatting and displaying currency symbols
 */

// Currency symbol mapping
const CURRENCY_SYMBOLS: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
  CNY: '¥',
  SEK: 'kr',
  // Add more currencies as needed
};

// Currency names for display
const CURRENCY_NAMES: { [key: string]: string } = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  INR: 'Indian Rupee',
  JPY: 'Japanese Yen',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan',
  SEK: 'Swedish Krona',
};

/**
 * Get currency symbol for a given currency code
 * @param currencyCode - ISO currency code (e.g., 'USD', 'INR')
 * @returns Currency symbol or the code itself if not found
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  return CURRENCY_SYMBOLS[currencyCode.toUpperCase()] || currencyCode;
};

/**
 * Get currency name for a given currency code
 * @param currencyCode - ISO currency code (e.g., 'USD', 'INR')
 * @returns Currency name or the code itself if not found
 */
export const getCurrencyName = (currencyCode: string): string => {
  return CURRENCY_NAMES[currencyCode.toUpperCase()] || currencyCode;
};

/**
 * Format currency amount with proper symbol and formatting
 * @param amount - The amount to format
 * @param currencyCode - ISO currency code
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currencyCode: string = 'INR',
  options: {
    showSymbol?: boolean;
    showCode?: boolean;
    decimals?: number;
    locale?: string;
  } = {}
): string => {
  const {
    showSymbol = true,
    showCode = false,
    decimals = 2,
    locale = 'en-IN'
  } = options;

  // Ensure amount is a valid number
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  
  // Format the number based on locale
  const formattedAmount = safeAmount.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  // Build the currency string
  let result = '';
  
  if (showSymbol) {
    const symbol = getCurrencySymbol(currencyCode);
    result = `${symbol}${formattedAmount}`;
  } else {
    result = formattedAmount;
  }
  
  if (showCode) {
    result += ` ${currencyCode.toUpperCase()}`;
  }
  
  return result;
};

/**
 * Format currency for compact display (e.g., in lists)
 * @param amount - The amount to format
 * @param currencyCode - ISO currency code
 * @returns Compact formatted currency string
 */
export const formatCurrencyCompact = (
  amount: number,
  currencyCode: string = 'INR'
): string => {
  return formatCurrency(amount, currencyCode, {
    showSymbol: true,
    showCode: false,
    decimals: amount % 1 === 0 ? 0 : 2, // No decimals for whole numbers
  });
};

/**
 * Format currency for detailed display (e.g., in transaction details)
 * @param amount - The amount to format
 * @param currencyCode - ISO currency code
 * @returns Detailed formatted currency string
 */
export const formatCurrencyDetailed = (
  amount: number,
  currencyCode: string = 'INR'
): string => {
  return formatCurrency(amount, currencyCode, {
    showSymbol: true,
    showCode: true,
    decimals: 2,
  });
};

/**
 * Parse currency string back to number
 * @param currencyString - Formatted currency string
 * @returns Parsed number or 0 if invalid
 */
export const parseCurrency = (currencyString: string): number => {
  // Remove currency symbols and non-numeric characters except decimal point
  const cleanString = currencyString.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleanString);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Get all supported currencies
 * @returns Array of currency objects with code, symbol, and name
 */
export const getSupportedCurrencies = () => {
  return Object.keys(CURRENCY_SYMBOLS).map(code => ({
    code,
    symbol: CURRENCY_SYMBOLS[code],
    name: CURRENCY_NAMES[code] || code,
  }));
};

/**
 * Check if a currency code is supported
 * @param currencyCode - ISO currency code to check
 * @returns True if supported, false otherwise
 */
export const isSupportedCurrency = (currencyCode: string): boolean => {
  return currencyCode.toUpperCase() in CURRENCY_SYMBOLS;
};