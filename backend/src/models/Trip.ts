import { Schema, model, models, type Document, type Types } from "mongoose";

export const TRANSPORT_MODES = ["flight", "train", "bus", "any"] as const;
export type TransportModePreference = (typeof TRANSPORT_MODES)[number];

export interface TripDocument extends Document {
  _id: Types.ObjectId;
  userId?: string;
  origin: string;
  destination: string;
  budget: number;
  days: number;
  transportModePreference: TransportModePreference;
  createdAt: Date;
}

const tripSchema = new Schema<TripDocument>({
  // Optional until Phase 6/7 add real user accounts — trips are anonymous
  // for now, matching the PRD's "userId (optional if login added)" field.
  userId: { type: String, required: false },
  origin: { type: String, required: true, trim: true },
  destination: { type: String, required: true, trim: true },
  budget: { type: Number, required: true, min: 0 },
  days: { type: Number, required: true, min: 1 },
  transportModePreference: {
    type: String,
    required: true,
    enum: TRANSPORT_MODES,
  },
  createdAt: { type: Date, default: Date.now },
});

// Guards against Mongoose's "OverwriteModelError" when this module is
// re-evaluated by tsx's watch-mode hot reload in development.
export const Trip = models.Trip ?? model<TripDocument>("Trip", tripSchema);
