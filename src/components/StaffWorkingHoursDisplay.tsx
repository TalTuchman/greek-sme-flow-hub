
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, User } from "lucide-react";
import { useTranslation } from "react-i18next";

interface StaffWorkingHoursDisplayProps {
  staff: {
    full_name: string;
    working_hours?: any;
  } | null;
}

export const StaffWorkingHoursDisplay = ({ staff }: StaffWorkingHoursDisplayProps) => {
  const { t } = useTranslation();

  if (!staff) return null;

  const workingHours = staff.working_hours;
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="h-4 w-4" />
          {staff.full_name}
        </CardTitle>
        <CardDescription>
          {t('bookings.staff_working_hours', 'Working hours')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {!workingHours ? (
          <Badge variant="secondary">
            {t('bookings.no_working_hours', 'No specific working hours set')}
          </Badge>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {days.map((day) => {
              const dayConfig = workingHours[day];
              const isEnabled = dayConfig?.enabled;
              
              return (
                <div key={day} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                  <span className="text-sm font-medium capitalize">
                    {t(`working_hours.${day}`, day)}
                  </span>
                  {isEnabled ? (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-sm">
                        {dayConfig.start} - {dayConfig.end}
                      </span>
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      {t('bookings.closed', 'Closed')}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
