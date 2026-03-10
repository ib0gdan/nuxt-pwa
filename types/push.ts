export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushSubscriptionRecord {
  id: string;
  userId: string;
  subscription: PushSubscriptionPayload;
  createdAt: string;
  updatedAt: string;
}

