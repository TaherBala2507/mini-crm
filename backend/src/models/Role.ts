import mongoose, { Document, Schema } from 'mongoose';
import { Permission } from '../constants/permissions';

export interface IRole extends Document {
  _id: mongoose.Types.ObjectId;
  orgId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    permissions: {
      type: [String],
      enum: Object.values(Permission),
      default: [],
    },
    isSystem: {
      type: Boolean,
      default: false,
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
        return ret;
      },
    },
  }
);

// Compound index for unique role name per organization
roleSchema.index({ orgId: 1, name: 1 }, { unique: true });
roleSchema.index({ orgId: 1 });

export const Role = mongoose.model<IRole>('Role', roleSchema);