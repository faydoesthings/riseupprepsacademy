/** Client-safe dashboard types (no Prisma / server imports). */

export type AdminChartData = {
  monthlyRevenue: { name: string; revenue: number }[];
  feeCollection: { name: string; value: number }[];
  collectionRate: number;
};

export type KpiIconName = "GraduationCap" | "DollarSign" | "AlertTriangle" | "Users";

export type KpiCard = {
  label: string;
  value: string;
  hint: string;
  iconName: KpiIconName;
  tone: "orange" | "teal" | "crimson" | "neutral";
};

export type AdminActivityItem = {
  action: string;
  detail: string;
  time: string;
  iconName: "UserPlus" | "DollarSign";
  tone: "teal" | "orange";
};
