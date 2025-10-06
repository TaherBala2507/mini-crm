import mongoose, { Document, Schema } from 'mongoose';
import { TaskStatus, TaskPriority } from '../constants/enums';

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  orgId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeUserId?: mongoose.Types.ObjectId;
  dueDate?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
    },
    assigneeUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    dueDate: {
      type: Date,
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
        if (ret.projectId) ret.projectId = ret.projectId.toString();
        if (ret.assigneeUserId) ret.assigneeUserId = ret.assigneeUserId.toString();
        return ret;
      },
    },
  }
);

// Indexes
taskSchema.index({ orgId: 1 });
taskSchema.index({ projectId: 1 });
taskSchema.index({ orgId: 1, status: 1 });
taskSchema.index({ orgId: 1, assigneeUserId: 1 });
taskSchema.index({ orgId: 1, priority: 1 });
taskSchema.index({ deletedAt: 1 });
taskSchema.index({ dueDate: 1 });

// Text index for search
taskSchema.index({ title: 'text', description: 'text' });

export const Task = mongoose.model<ITask>('Task', taskSchema);