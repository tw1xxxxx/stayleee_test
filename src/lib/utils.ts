export const formatPrice = (price: number | string): string => {
  const numericPrice = typeof price === 'string' ? Number(price) : price;
  if (isNaN(numericPrice)) return '0';
  return numericPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};
