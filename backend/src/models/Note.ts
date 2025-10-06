import mongoose, { Document, Schema } from 'mongoose';
import { EntityType } from '../constants/enums';

export interface INote extends Document {
  _id: mongoose.Types.ObjectId;
  orgId: mongoose.Types.ObjectId;
  entityType: EntityType;
  entityId: mongoose.Types.ObjectId;
  authorUserId: mongoose.Types.ObjectId;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
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
    authorUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 5000,
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
        if (ret.authorUserId) ret.authorUserId = ret.authorUserId.toString();
        return ret;
      },
    },
  }
);

// Indexes
noteSchema.index({ orgId: 1 });
noteSchema.index({ entityType: 1, entityId: 1 });
noteSchema.index({ authorUserId: 1 });
noteSchema.index({ createdAt: -1 });

export const Note = mongoose.model<INote>('Note', noteSchema);