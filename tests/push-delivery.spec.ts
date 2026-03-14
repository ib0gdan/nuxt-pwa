import { describe, expect, it } from "vitest";
import {
  collectDueUndelivered,
  createPushPayload,
  isDueReminder,
  shouldDropSubscription,
  toPushDeliveryError,
} from "../server/utils/push-delivery";

const toDate = (value: Date): string => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toTime = (value: Date): string => {
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

describe("push-delivery unit", () => {
  it("marks due reminder based on date/time", () => {
    const now = Date.now();
    const past = new Date(now - 60_000);
    const future = new Date(now + 60_000);
    expect(isDueReminder({ date: toDate(past), time: toTime(past) }, now)).toBe(true);
    expect(isDueReminder({ date: toDate(future), time: toTime(future) }, now)).toBe(false);
  });

  it("builds json payload", () => {
    const payload = JSON.parse(
      createPushPayload({ id: "1", title: "Drink water", description: "" }),
    );
    expect(payload.title).toBe("Напоминание");
    expect(payload.body).toContain("Drink water");
    expect(payload.reminderId).toBe("1");
  });

  it("normalizes webpush error", () => {
    const error = toPushDeliveryError({
      statusCode: 410,
      body: "expired",
      message: "gone",
    });
    expect(error.statusCode).toBe(410);
    expect(error.body).toBe("expired");
    expect(error.message).toBe("gone");
    expect(shouldDropSubscription(error.statusCode)).toBe(true);
  });
});

describe("push-delivery integration-like", () => {
  it("collects only due and undelivered reminders", () => {
    const now = Date.now();
    const past = new Date(now - 60_000);
    const future = new Date(now + 300_000);
    const reminders = [
      {
        id: "a",
        title: "A",
        description: "",
        date: toDate(past),
        time: toTime(past),
        completed: false,
        createdAt: "",
        updatedAt: "",
        category: "other" as const,
        order: 1,
      },
      {
        id: "b",
        title: "B",
        description: "",
        date: toDate(future),
        time: toTime(future),
        completed: false,
        createdAt: "",
        updatedAt: "",
        category: "other" as const,
        order: 2,
      },
      {
        id: "c",
        title: "C",
        description: "",
        date: toDate(past),
        time: toTime(past),
        completed: true,
        createdAt: "",
        updatedAt: "",
        category: "other" as const,
        order: 3,
      },
    ];
    const result = collectDueUndelivered(reminders, new Set(["a"]), now);
    expect(result.map((item) => item.id)).toEqual([]);
    const result2 = collectDueUndelivered(reminders, new Set(), now);
    expect(result2.map((item) => item.id)).toEqual(["a"]);
  });
});
