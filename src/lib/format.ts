export function formatPKR(amount: number): string {
  if (amount >= 1_000_000) {
    return `PKR ${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `PKR ${Math.round(amount / 1_000)}K`;
  }
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

export function formatRole(role: string): string {
  return role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
