export const toReminderISO = (date: string, time: string): string => {
  return new Date(`${date}T${time}:00`).toISOString();
};

export const isReminderDue = (date: string, time: string, now: Date = new Date()): boolean => {
  return new Date(`${date}T${time}:00`).getTime() <= now.getTime();
};

