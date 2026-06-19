export function formatPKR(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) {
    return "PKR 0";
  }
  const value = amount;
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return `${sign}PKR ${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}PKR ${Math.round(abs / 1_000)}K`;
  }
  return `${sign}PKR ${abs.toLocaleString("en-PK")}`;
}

export function formatRole(role: string): string {
  return role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
