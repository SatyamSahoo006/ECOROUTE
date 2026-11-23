import mongoose, { Schema, Document } from 'mongoose'

export interface ISavedItinerary extends Document {
  userId: mongoose.Types.ObjectId
  destination: string
  payload: Record<string, any>
  result: Record<string, any>
  createdAt: Date
}

const SavedItinerarySchema = new Schema<ISavedItinerary>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  destination: { type: String },
  payload: { type: Schema.Types.Mixed },
  result: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
})

export const SavedItinerary = mongoose.model<ISavedItinerary>('SavedItinerary', SavedItinerarySchema)
