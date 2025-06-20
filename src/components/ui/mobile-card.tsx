
import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface MobileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const MobileCard = React.forwardRef<HTMLDivElement, MobileCardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Card ref={ref} className={cn("mb-3", className)} {...props}>
        <CardContent className="p-4">
          {children}
        </CardContent>
      </Card>
    );
  }
);

MobileCard.displayName = "MobileCard";

interface MobileCardRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
}

export const MobileCardRow = React.forwardRef<HTMLDivElement, MobileCardRowProps>(
  ({ className, label, value, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex justify-between items-center py-1", className)} {...props}>
        <span className="text-sm text-muted-foreground font-medium">{label}:</span>
        <span className="text-sm font-medium">{value}</span>
      </div>
    );
  }
);

MobileCardRow.displayName = "MobileCardRow";

interface MobileCardActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const MobileCardActions = React.forwardRef<HTMLDivElement, MobileCardActionsProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex gap-2 mt-3 pt-3 border-t", className)} {...props}>
        {children}
      </div>
    );
  }
);

MobileCardActions.displayName = "MobileCardActions";
