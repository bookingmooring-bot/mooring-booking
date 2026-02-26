import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export interface CalendarDay {
  date: Date;
  available: boolean;
  customPrice?: number;
}

interface MonthlyCalendarProps {
  year: number;
  calendarDays: CalendarDay[];
  onToggle: (index: number) => void;
  onPriceChange?: (index: number, price: number) => void;
  basePrice?: number;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MonthlyCalendar = ({ year, calendarDays, onToggle, onPriceChange, basePrice }: MonthlyCalendarProps) => {
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(0);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [tempPrice, setTempPrice] = useState("");

  const getDaysInMonth = (month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getMonthDays = (month: number) => {
    const startOfYear = new Date(year, 0, 1);
    const startOfMonth = new Date(year, month, 1);
    const dayOffset = Math.floor((startOfMonth.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    const daysInMonth = getDaysInMonth(month);
    return calendarDays.slice(dayOffset, dayOffset + daysInMonth);
  };

  const monthDays = getMonthDays(currentMonth);
  const firstDayOfWeek = getFirstDayOfMonth(currentMonth);
  const startOfYear = new Date(year, 0, 1);
  const startOfMonth = new Date(year, currentMonth, 1);
  const dayOffset = Math.floor((startOfMonth.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));

  const handlePriceSave = (globalIndex: number) => {
    if (onPriceChange && tempPrice) {
      onPriceChange(globalIndex, parseFloat(tempPrice));
    }
    setEditingDay(null);
    setTempPrice("");
  };

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" size="icon" onClick={() => setCurrentMonth(prev => Math.max(0, prev - 1))} disabled={currentMonth === 0} className="h-9 w-9">
          <ChevronLeft size={18} />
        </Button>
        <div className="flex items-center gap-2">
          <h3 className="font-heading font-semibold text-lg text-foreground">
            {MONTH_NAMES[currentMonth]} {year}
          </h3>
          <select value={currentMonth} onChange={(e) => setCurrentMonth(Number(e.target.value))} className="ml-2 bg-muted border border-border rounded-md px-2 py-1 text-sm text-foreground">
            {MONTH_NAMES.map((name, idx) => (
              <option key={idx} value={idx}>{name}</option>
            ))}
          </select>
        </div>
        <Button type="button" variant="outline" size="icon" onClick={() => setCurrentMonth(prev => Math.min(11, prev + 1))} disabled={currentMonth === 11} className="h-9 w-9">
          <ChevronRight size={18} />
        </Button>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-success rounded" />
          <span className="text-sm text-muted-foreground">{t('provider.available')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-destructive rounded" />
          <span className="text-sm text-muted-foreground">{t('provider.booked')}</span>
        </div>
        {onPriceChange && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gold/50 rounded border border-gold" />
            <span className="text-sm text-muted-foreground">Custom price</span>
          </div>
        )}
      </div>

      {onPriceChange && (
        <p className="text-xs text-muted-foreground text-center">
          💡 Double-click a day to set a custom price. Click once to toggle availability.
        </p>
      )}

      {/* Calendar Grid */}
      <div className="bg-muted/50 rounded-xl p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAY_NAMES.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div key={`empty-${idx}`} className="p-2" />
          ))}
          
          {monthDays.map((day, idx) => {
            const globalIndex = dayOffset + idx;
            const hasCustomPrice = day.customPrice !== undefined && day.customPrice > 0;
            const isEditing = editingDay === globalIndex;

            if (isEditing) {
              return (
                <div key={idx} className="flex flex-col items-center gap-1 p-1 bg-gold/10 rounded-lg border border-gold">
                  <span className="text-xs font-medium text-foreground">{day.date.getDate()}</span>
                  <Input
                    type="number"
                    value={tempPrice}
                    onChange={(e) => setTempPrice(e.target.value)}
                    className="h-6 w-full text-xs px-1 text-center"
                    placeholder={basePrice ? `${basePrice}` : "€"}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handlePriceSave(globalIndex);
                      if (e.key === 'Escape') { setEditingDay(null); setTempPrice(""); }
                    }}
                    onBlur={() => handlePriceSave(globalIndex)}
                  />
                </div>
              );
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onToggle(globalIndex)}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  if (onPriceChange) {
                    setEditingDay(globalIndex);
                    setTempPrice(day.customPrice ? String(day.customPrice) : "");
                  }
                }}
                className={cn(
                  "p-1 rounded-lg text-xs font-medium transition-all min-h-[2.75rem] w-full flex flex-col items-center justify-center",
                  day.available
                    ? hasCustomPrice
                      ? "bg-gold/20 text-gold hover:bg-gold/30 border border-gold/30"
                      : "bg-success/20 text-success hover:bg-success/30 border border-success/30"
                    : "bg-destructive/20 text-destructive hover:bg-destructive/30 border border-destructive/30"
                )}
              >
                <span>{day.date.getDate()}</span>
                {hasCustomPrice && (
                  <span className="text-[10px] font-bold">€{day.customPrice}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button type="button" variant="outline" size="sm" onClick={() => {
          const daysInMonth = getDaysInMonth(currentMonth);
          for (let i = 0; i < daysInMonth; i++) {
            const globalIdx = dayOffset + i;
            if (!calendarDays[globalIdx].available) onToggle(globalIdx);
          }
        }}>
          Mark All Available
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => {
          const daysInMonth = getDaysInMonth(currentMonth);
          for (let i = 0; i < daysInMonth; i++) {
            const globalIdx = dayOffset + i;
            if (calendarDays[globalIdx].available) onToggle(globalIdx);
          }
        }}>
          Mark All Booked
        </Button>
      </div>

      {/* Month Overview */}
      <div className="flex justify-center gap-1 mt-4">
        {MONTH_NAMES.map((_, idx) => (
          <button key={idx} type="button" onClick={() => setCurrentMonth(idx)} className={cn(
            "w-6 h-6 rounded text-xs font-medium transition-all",
            idx === currentMonth ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}>
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MonthlyCalendar;
