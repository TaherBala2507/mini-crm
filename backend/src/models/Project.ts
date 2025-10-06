import mongoose, { Document, Schema } from 'mongoose';
import { ProjectStatus } from '../constants/enums';

export interface IProjectMember {
  userId: mongoose.Types.ObjectId;
  role: string; // e.g., 'Project Manager', 'Developer', 'Designer'
  addedAt: Date;
}

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  orgId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  client?: string;
  status: ProjectStatus;
  leadId?: mongoose.Types.ObjectId; // Reference to converted lead
  budget?: number;
  startDate?: Date;
  endDate?: Date;
  members: IProjectMember[]; // Team members assigned to project
  managerUserId?: mongoose.Types.ObjectId; // Primary project manager
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const projectMemberSchema = new Schema<IProjectMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
      default: 'Member',
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const projectSchema = new Schema<IProject>(
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
      minlength: 2,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    client: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.ACTIVE,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
    },
    budget: {
      type: Number,
      min: 0,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    members: {
      type: [projectMemberSchema],
      default: [],
    },
    managerUserId: {
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
        if (ret.leadId) ret.leadId = ret.leadId.toString();
        if (ret.managerUserId) ret.managerUserId = ret.managerUserId.toString();
        if (ret.members) {
          // Add memberIds array for frontend compatibility
          ret.memberIds = ret.members.map((member: any) => member.userId.toString());
          ret.members = ret.members.map((member: any) => ({
            ...member,
            userId: member.userId.toString(),
          }));
        }
        return ret;
      },
    },
  }
);

// Indexes
projectSchema.index({ orgId: 1 });
projectSchema.index({ orgId: 1, status: 1 });
projectSchema.index({ orgId: 1, managerUserId: 1 });
projectSchema.index({ orgId: 1, leadId: 1 });
projectSchema.index({ deletedAt: 1 });
projectSchema.index({ updatedAt: -1 });
projectSchema.index({ startDate: 1 });
projectSchema.index({ endDate: 1 });

// Text index for search
projectSchema.index({ name: 'text', description: 'text', client: 'text' });

export const Project = mongoose.model<IProject>('Project', projectSchema);