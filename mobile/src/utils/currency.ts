export function formatCurrency(amount: number | string, currency = 'INR'): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (Number.isNaN(value)) return currency === 'INR' ? '₹0' : `${currency} 0`;

  if (currency === 'INR') {
    const formatted = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(Math.abs(value));
    return `${value < 0 ? '-' : ''}₹${formatted}`;
  }

  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}
