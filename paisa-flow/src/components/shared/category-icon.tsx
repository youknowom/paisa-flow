import { getCategoryStyle } from "@/lib/category-config";
import { cn } from "@/lib/utils";

interface CategoryIconProps {
  category: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { box: "w-8 h-8", icon: 14, radius: "rounded-xl" },
  md: { box: "w-10 h-10", icon: 18, radius: "rounded-xl" },
  lg: { box: "w-12 h-12", icon: 22, radius: "rounded-2xl" },
};

export function CategoryIcon({
  category,
  size = "md",
  className,
}: CategoryIconProps) {
  const style = getCategoryStyle(category);
  const Icon = style.icon;
  const dims = sizeMap[size];

  return (
    <div
      className={cn(
        dims.box,
        dims.radius,
        "flex items-center justify-center flex-shrink-0",
        className,
      )}
      style={{ backgroundColor: style.bgTint }}
    >
      <Icon size={dims.icon} style={{ color: style.color }} strokeWidth={1.75} />
    </div>
  );
}
