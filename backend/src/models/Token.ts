import mongoose, { Document, Schema } from 'mongoose';
import { TokenType } from '../constants/enums';
import crypto from 'crypto';

export interface IToken extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: TokenType;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const tokenSchema = new Schema<IToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TokenType),
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        if (ret.userId) ret.userId = ret.userId.toString();
        return ret;
      },
    },
  }
);

// Indexes
tokenSchema.index({ userId: 1, type: 1 });
tokenSchema.index({ tokenHash: 1 });
tokenSchema.index({ expiresAt: 1 });

// Static method to hash token
tokenSchema.statics.hashToken = function (token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const Token = mongoose.model<IToken>('Token', tokenSchema);