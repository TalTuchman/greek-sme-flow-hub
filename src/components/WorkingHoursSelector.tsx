
import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
type Day = typeof days[number];

type DayHours = {
    enabled: boolean;
    start: string;
    end: string;
};

export type WorkingHours = Record<Day, DayHours>;

type PartialDayHours = Partial<DayHours>;

interface WorkingHoursSelectorProps {
    value: Partial<Record<Day, PartialDayHours>> | null;
    onChange: (value: WorkingHours) => void;
}

const defaultDayValue: DayHours = { enabled: false, start: '09:00', end: '17:00' };

export const WorkingHoursSelector: React.FC<WorkingHoursSelectorProps> = ({ value, onChange }) => {
    const { t } = useTranslation();
    
    const internalState = React.useMemo(() => {
        const state = {} as WorkingHours;
        const initialValue = value || {};
        for (const day of days) {
            const dayValue = initialValue[day];
            state[day] = {
                enabled: dayValue?.enabled ?? !['saturday', 'sunday'].includes(day),
                start: dayValue?.start ?? defaultDayValue.start,
                end: dayValue?.end ?? defaultDayValue.end,
            };
        }
        return state;
    }, [value]);

    const handleDayChange = (day: Day, field: keyof DayHours, fieldValue: string | boolean) => {
        const newState = { ...internalState };
        newState[day] = { ...newState[day], [field]: fieldValue };
        onChange(newState);
    };

    return (
        <div className="space-y-2 rounded-md border p-4">
            {days.map((day) => (
                <div key={day} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-md hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                        <Switch
                            id={`${day}-enabled`}
                            checked={internalState[day].enabled}
                            onCheckedChange={(checked) => handleDayChange(day, 'enabled', checked)}
                        />
                        <Label htmlFor={`${day}-enabled`} className="capitalize text-base font-medium">
                            {t(`working_hours.${day}`)}
                        </Label>
                    </div>
                    <div className="flex items-center gap-2 pl-8 sm:pl-0">
                        <Input
                            type="time"
                            value={internalState[day].start}
                            onChange={(e) => handleDayChange(day, 'start', e.target.value)}
                            className="w-28"
                            disabled={!internalState[day].enabled}
                        />
                        <span className={!internalState[day].enabled ? 'text-muted-foreground' : ''}>-</span>
                        <Input
                            type="time"
                            value={internalState[day].end}
                            onChange={(e) => handleDayChange(day, 'end', e.target.value)}
                            className="w-28"
                            disabled={!internalState[day].enabled}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};
