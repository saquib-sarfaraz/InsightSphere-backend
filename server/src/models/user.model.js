import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { RoleList, Roles } from '../constants/roles.js'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, unique: true, index: true, required: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: RoleList, default: Roles.USER, index: true },
    status: { type: String, enum: ['active', 'invited', 'suspended'], default: 'active', index: true },
    isEmailVerified: { type: Boolean, default: false, index: true },

    emailVerificationTokenHash: { type: String, select: false },
    emailVerificationExpiresAt: { type: Date },

    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpiresAt: { type: Date },

    refreshTokenHash: { type: String, select: false },
    refreshTokenExpiresAt: { type: Date },

    lastLoginAt: { type: Date },
  },
  { timestamps: true },
)

userSchema.methods.verifyPassword = async function verifyPassword(password) {
  return bcrypt.compare(password, this.passwordHash)
}

export const User = mongoose.model('User', userSchema)

