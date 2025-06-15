
import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

type DayHours = {
    enabled: boolean;
    start: string;
    end: string;
};

export type WorkingHours = {
    [key: string]: DayHours;
};

interface WorkingHoursSelectorProps {
    value: WorkingHours | null;
    onChange: (value: WorkingHours | null) => void;
}

const defaultDayValue = { enabled: false, start: '09:00', end: '17:00' };

export const WorkingHoursSelector: React.FC<WorkingHoursSelectorProps> = ({ value, onChange }) => {
    
    const internalState = React.useMemo(() => {
        const state: WorkingHours = {};
        const initialValue = value || {};
        for (const day of days) {
            state[day] = initialValue[day] ?? { ...defaultDayValue, enabled: !['saturday', 'sunday'].includes(day) };
        }
        return state;
    }, [value]);

    const handleDayChange = (day: string, field: keyof DayHours, fieldValue: string | boolean) => {
        const newState = { ...internalState };
        newState[day] = { ...newState[day], [field]: fieldValue };
        
        // if disabling, we don't clear the times to preserve them if re-enabled
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
                        <Label htmlFor={`${day}-enabled`} className="capitalize text-base font-medium">{day}</Label>
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
