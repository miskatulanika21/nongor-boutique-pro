export const bdt = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

export const taka = (n: number) => `৳${bdt(n)}`;
