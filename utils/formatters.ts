
/**
 * Formats numbers in the Indian numbering system (Lakh/Crore)
 */
export const formatINR = (amount: number, hideSymbol: boolean = false): string => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: hideSymbol ? 'decimal' : 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
};

export const parseAmount = (value: string): number => {
  const clean = value.replace(/[^0-9.]/g, '');
  return parseFloat(clean) || 0;
};
