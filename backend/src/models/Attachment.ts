import mongoose, { Document, Schema } from 'mongoose';
import { EntityType } from '../constants/enums';

export interface IAttachment extends Document {
  _id: mongoose.Types.ObjectId;
  orgId: mongoose.Types.ObjectId;
  entityType: EntityType;
  entityId: mongoose.Types.ObjectId;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  storageUrl: string;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema = new Schema<IAttachment>(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    entityType: {
      type: String,
      enum: Object.values(EntityType),
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    sizeBytes: {
      type: Number,
      required: true,
    },
    storageUrl: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
        if (ret.entityId) ret.entityId = ret.entityId.toString();
        if (ret.uploadedBy) ret.uploadedBy = ret.uploadedBy.toString();
        return ret;
      },
    },
  }
);

// Indexes
attachmentSchema.index({ orgId: 1 });
attachmentSchema.index({ entityType: 1, entityId: 1 });
attachmentSchema.index({ uploadedBy: 1 });
attachmentSchema.index({ createdAt: -1 });

export const Attachment = mongoose.model<IAttachment>('Attachment', attachmentSchema);