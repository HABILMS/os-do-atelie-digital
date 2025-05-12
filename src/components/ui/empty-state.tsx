
import { ReactNode } from "react";
import { Button } from "./button";
import { Package } from "lucide-react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-xl border border-lacos-rose">
      <div className="w-16 h-16 rounded-full bg-lacos-rose flex items-center justify-center text-lacos-primary mb-4">
        {icon || <Package size={32} />}
      </div>
      <h3 className="text-xl font-medium text-lacos-dark mb-2">{title}</h3>
      <p className="text-center text-gray-500 mb-6 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}
