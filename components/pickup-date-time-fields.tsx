"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function buildCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = Array.from({ length: firstDay.getDay() }, () => null);
  const days = Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1));

  return [...leadingBlanks, ...days];
}

export function PickupDateTimeFields() {
  const today = useMemo(() => startOfToday(), []);
  const [monthDate, setMonthDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("09:00");

  const calendarDays = useMemo(() => buildCalendarDays(monthDate), [monthDate]);
  const monthLabel = new Intl.DateTimeFormat("en-AU", {
    month: "long",
    year: "numeric"
  }).format(monthDate);
  const canGoPrevious = !isSameMonth(monthDate, today);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
      <div className="grid gap-2">
        <span className="label">Preferred pickup date</span>
        <input type="hidden" name="pickup_date" value={selectedDate} />
        <div className="rounded-2xl border border-line bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition hover:border-qpet hover:text-qpet-dark disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:border-line"
              disabled={!canGoPrevious}
              onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))}
              aria-label="Previous month"
            >
              <ChevronLeft size={17} />
            </button>
            <p className="text-sm font-bold text-ink">{monthLabel}</p>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition hover:border-qpet hover:text-qpet-dark"
              onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))}
              aria-label="Next month"
            >
              <ChevronRight size={17} />
            </button>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500">
            {weekdayLabels.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (!day) return <span key={`blank-${index}`} className="aspect-square" />;

              const dateValue = formatDateValue(day);
              const isMonday = day.getDay() === 1;
              const isPast = day < today;
              const disabled = isMonday || isPast;
              const selected = selectedDate === dateValue;

              return (
                <button
                  key={dateValue}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelectedDate(dateValue)}
                  className={`aspect-square rounded-full text-sm font-semibold transition ${
                    selected
                      ? "bg-qpet text-white shadow-sm"
                      : disabled
                        ? "cursor-not-allowed bg-slate-50 text-slate-300"
                        : "text-ink hover:bg-qpet-soft hover:text-qpet-dark"
                  }`}
                  aria-label={new Intl.DateTimeFormat("en-AU", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  }).format(day)}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-slate-500">Mondays are unavailable.</p>
        </div>
      </div>

      <label className="grid h-fit gap-2">
        <span className="label">Preferred pickup time</span>
        <input
          className="field"
          type="time"
          name="pickup_time"
          min="09:00"
          max="17:00"
          step="60"
          value={selectedTime}
          onChange={(event) => setSelectedTime(event.target.value)}
          required
        />
        <span className="text-xs text-slate-500">Choose any minute from 09:00 to 17:00.</span>
      </label>
    </div>
  );
}
