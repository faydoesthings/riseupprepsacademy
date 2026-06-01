import { LucideIcon } from "lucide-react";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="glass-card w-16 h-16 flex items-center justify-center mb-5 rounded-2xl">
        <Icon className="w-8 h-8 text-[#F78C1F]" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/40 max-w-sm mb-6 leading-relaxed">{description}</p>
      {action}
    </div>
  );
}
