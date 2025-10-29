export const WorkerOperation = {
  GetAreaCapacity: "GetAreaCapacity",
  GetZoneCapacity: "GetZoneCapacity",
} as const;

export type WorkerOperation = typeof WorkerOperation[keyof typeof WorkerOperation];
