export type ReminderCategory = "work" | "personal" | "health" | "other";

export interface Reminder {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  category: ReminderCategory;
  order: number;
}

export interface ReminderInput {
  title: string;
  description: string;
  date: string;
  time: string;
  category: ReminderCategory;
}

export interface ReminderUpdate extends Partial<ReminderInput> {
  completed?: boolean;
  order?: number;
}

export type ReminderFilter = "all" | "active" | "completed";

