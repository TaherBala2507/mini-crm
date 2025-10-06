import mongoose, { Document, Schema } from 'mongoose';
import { LeadStatus, LeadSource } from '../constants/enums';

export interface ILead extends Document {
  _id: mongoose.Types.ObjectId;
  orgId: mongoose.Types.ObjectId;
  title: string;
  company: string;
  contactName: string;
  email?: string;
  phone?: string;
  source: LeadSource;
  status: LeadStatus;
  ownerUserId?: mongoose.Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    contactName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      enum: Object.values(LeadSource),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(LeadStatus),
      default: LeadStatus.NEW,
    },
    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    deletedAt: {
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
        if (ret.orgId) ret.orgId = ret.orgId.toString();
        if (ret.ownerUserId) ret.ownerUserId = ret.ownerUserId.toString();
        return ret;
      },
    },
  }
);

// Indexes
leadSchema.index({ orgId: 1 });
leadSchema.index({ orgId: 1, status: 1 });
leadSchema.index({ orgId: 1, ownerUserId: 1 });
leadSchema.index({ orgId: 1, source: 1 });
leadSchema.index({ deletedAt: 1 });
leadSchema.index({ createdAt: -1 });

// Text index for search
leadSchema.index({ title: 'text', company: 'text', contactName: 'text' });

export const Lead = mongoose.model<ILead>('Lead', leadSchema);