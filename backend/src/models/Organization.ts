import mongoose, { Document, Schema } from 'mongoose';
import { OrganizationStatus } from '../constants/enums';

export interface IOrganization extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  domain: string;
  status: OrganizationStatus;
  settings?: {
    // Business settings
    timezone?: string;
    currency?: string;
    dateFormat?: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
    timeFormat?: '12h' | '24h';
    
    // Lead settings
    customLeadStatuses?: string[];
    customLeadSources?: string[];
    
    // Required fields configuration
    requiredFields?: {
      lead?: {
        company?: boolean;
        phone?: boolean;
        source?: boolean;
      };
      project?: {
        client?: boolean;
        description?: boolean;
      };
    };
    
    // Feature flags
    features?: {
      enableEmailNotifications?: boolean;
      enableTaskReminders?: boolean;
      enableAuditLog?: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    domain: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: Object.values(OrganizationStatus),
      default: OrganizationStatus.ACTIVE,
    },
    settings: {
      type: Schema.Types.Mixed,
      default: {
        timezone: 'UTC',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        customLeadStatuses: [],
        customLeadSources: [],
        requiredFields: {
          lead: {
            company: false,
            phone: false,
            source: false,
          },
          project: {
            client: false,
            description: false,
          },
        },
        features: {
          enableEmailNotifications: true,
          enableTaskReminders: true,
          enableAuditLog: true,
        },
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
// Note: domain index is automatically created by unique: true constraint
organizationSchema.index({ status: 1 });

export const Organization = mongoose.model<IOrganization>('Organization', organizationSchema);