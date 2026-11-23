import mongoose from 'mongoose'
import { User as MUser } from './User'
import { SavedItinerary as MItinerary } from './Itinerary'
import { isMemoryStore } from '../config/db'

const memUsers = new Map<string, any>()
const memItins = new Map<string, any>()

export const UserRepo = {
  async findByEmail(email: string) {
    if (!isMemoryStore()) return MUser.findOne({ email })
    return Array.from(memUsers.values()).find((u) => u.email === email) || null
  },
  async findByVerifyToken(token: string) {
    if (!isMemoryStore()) return MUser.findOne({ emailVerifyToken: token })
    return Array.from(memUsers.values()).find((u) => u.emailVerifyToken === token) || null
  },
  async create(data: any) {
    if (!isMemoryStore()) return MUser.create(data)
    const u: any = { ...data, _id: 'mem_' + Math.random().toString(36).slice(2) }
    u.save = async () => {
      memUsers.set(u._id, u)
      return u
    }
    memUsers.set(u._id, u)
    return u
  },
  async save(user: any) {
    if (!isMemoryStore()) return user.save()
    memUsers.set(user._id, user)
    return user
  },
}

export const ItineraryRepo = {
  async create(data: any) {
    if (!isMemoryStore()) return MItinerary.create(data)
    const d: any = { ...data, _id: 'mem_' + Math.random().toString(36).slice(2) }
    memItins.set(d._id, d)
    return d
  },
  async findByUser(userId: string) {
    if (!isMemoryStore()) return MItinerary.find({ userId }).sort({ createdAt: -1 })
    return Array.from(memItins.values()).filter((i) => i.userId === userId)
  },
}
