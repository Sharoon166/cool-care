import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

/**
 * Formats a number as Pakistani Rupee (PKR) currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
	amount: number | string,
	options: {
		minimumFractionDigits?: number;
		maximumFractionDigits?: number;
		showSymbol?: boolean;
		locale?: string;
		notation?: Intl.NumberFormatOptions['notation']; // "standard" | "compact"
		compactDisplay?: Intl.NumberFormatOptions['compactDisplay']; // "short" | "long"
	} = {}
): string {
	const {
		minimumFractionDigits = 0,
		maximumFractionDigits = 2,
		showSymbol = true,
		locale = 'en-PK',
		notation = Number(amount) <= 10_00_000 ? 'standard' : 'compact',
		compactDisplay = 'short'
	} = options;

	const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

	if (isNaN(numericAmount)) {
		return showSymbol ? 'Rs. 0' : '0';
	}

	const formatted = new Intl.NumberFormat(locale, {
		minimumFractionDigits,
		maximumFractionDigits,
		notation,
		...(notation === 'compact' && { compactDisplay })
	}).format(numericAmount);

	return showSymbol ? `Rs. ${formatted}` : formatted;
}

/**
 * Formats a number as Pakistani Rupee with common presets
 */
export const formatPKR = {
	/**
	 * Format as currency with symbol (Rs. 1,234.56)
	 */
	standard: (amount: number | string) => formatCurrency(amount),

	/**
	 * Format without symbol (1,234.56)
	 */
	compact: (amount: number | string) => formatCurrency(amount, { showSymbol: false }),

	/**
	 * Format with exact 2 decimal places
	 */
	exact: (amount: number | string) =>
		formatCurrency(amount, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}),

	/**
	 * Format as whole numbers only
	 */
	whole: (amount: number | string) =>
		formatCurrency(amount, {
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}),

	/**
	 * Format with short notation (K, M, B)
	 */
	short: (amount: number | string) => {
		const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

		if (isNaN(numericAmount)) {
			return 'Rs. 0';
		}

		const abs = Math.abs(numericAmount);
		const sign = numericAmount < 0 ? '-' : '';

		if (abs >= 1e9) {
			return `${sign}Rs. ${(abs / 1e9).toFixed(1)}B`;
		} else if (abs >= 1e6) {
			return `${sign}Rs. ${(abs / 1e6).toFixed(1)}M`;
		} else if (abs >= 1e3) {
			return `${sign}Rs. ${(abs / 1e3).toFixed(1)}K`;
		} else {
			return formatCurrency(numericAmount);
		}
	}
};

export const formatDate = {
	/**
	 * Format date in short format (e.g., "Jan 1, 2023")
	 */
	short: (date: Date | string) => {
		const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
		return new Date(date).toLocaleDateString('en-US', options);
	},
	/**
	 * Format date in long format (e.g., "January 1, 2023")
	 */
	long: (date: Date | string) => {
		const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
		return new Date(date).toLocaleDateString('en-US', options);
	},
	/**
	 * Format date in full format (e.g., "Monday, January 1, 2023")
	 */
	full: (date: Date | string) => {
		const options: Intl.DateTimeFormatOptions = {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			weekday: 'long'
		};
		return new Date(date).toLocaleDateString('en-US', options);
	}
};

export function formatNumber(num: number): string {
	return new Intl.NumberFormat('en-US').format(num);
}
