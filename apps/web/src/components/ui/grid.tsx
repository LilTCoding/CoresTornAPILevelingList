import { cn } from "@/lib/utils";

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Grid({ children, className, ...props }: GridProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3", className)} {...props}>
      {children}
    </div>
  );
}

interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function GridItem({ children, className, ...props }: GridItemProps) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
} 