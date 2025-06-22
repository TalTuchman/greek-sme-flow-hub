
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import type { Database } from "@/integrations/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

interface BookingStatusFilterProps {
  value: BookingStatus | "all";
  onChange: (value: BookingStatus | "all") => void;
}

const statusVariants: Record<BookingStatus, "default" | "secondary" | "destructive"> = {
  scheduled: "default",
  completed: "secondary", 
  cancelled: "destructive",
};

const statusLabels: Record<BookingStatus | "all", string> = {
  all: "All Bookings",
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const BookingStatusFilter = ({ value, onChange }: BookingStatusFilterProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Filter:</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue>
            {value === "all" ? (
              statusLabels.all
            ) : (
              <Badge variant={statusVariants[value as BookingStatus]} className="text-xs">
                {statusLabels[value]}
              </Badge>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Bookings</SelectItem>
          <SelectItem value="scheduled">
            <Badge variant="default" className="text-xs">Scheduled</Badge>
          </SelectItem>
          <SelectItem value="completed">
            <Badge variant="secondary" className="text-xs">Completed</Badge>
          </SelectItem>
          <SelectItem value="cancelled">
            <Badge variant="destructive" className="text-xs">Cancelled</Badge>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
