import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  email: string
  password?: string
  name: string
  googleId?: string
  isEmailVerified: boolean
  emailVerifyToken?: string
  emailVerifyTokenExpires?: Date
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String },
  name: { type: String, required: true },
  googleId: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  emailVerifyToken: { type: String },
  emailVerifyTokenExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
})

export const User = mongoose.model<IUser>('User', UserSchema)
