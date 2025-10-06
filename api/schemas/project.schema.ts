import { Schema, model, Document } from 'mongoose';
import { ProjectModel, TeamMember, ProjectPolicyAcceptance } from '../models/project.model';
import { AnalysisResultModel } from '../models/analysisResult.model';
import { DeploymentModel } from '../models/deployment.model';
import { ChatMessage } from '../models/deployment.model';

// Interface pour le document Mongoose
export interface IProjectDocument extends Omit<ProjectModel, 'id'>, Document {}

// Sous-schémas
const TeamMemberSchema = new Schema<TeamMember>({
  name: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String, required: true },
  bio: { type: String, required: true },
  pictureUrl: { type: String },
  socialLinks: {
    linkedin: { type: String },
    github: { type: String },
    twitter: { type: String }
  }
}, { _id: false });

const ProjectPolicyAcceptanceSchema = new Schema<ProjectPolicyAcceptance>({
  privacyPolicyAccepted: { type: Boolean, required: true },
  termsOfServiceAccepted: { type: Boolean, required: true },
  betaPolicyAccepted: { type: Boolean, required: true },
  marketingAccepted: { type: Boolean, required: true },
  acceptedAt: { type: Date, required: true },
  ipAddress: { type: String },
  userAgent: { type: String }
}, { _id: false });

const ChatMessageSchema = new Schema<ChatMessage>({
  sender: { type: String, enum: ['user', 'ai'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRequestingDetails: { type: Boolean },
  isProposingArchitecture: { type: Boolean },
  isRequestingSensitiveVariables: { type: Boolean },
  proposedComponents: { type: Schema.Types.Mixed },
  asciiArchitecture: { type: String },
  archetypeUrl: { type: String },
  requestedSensitiveVariables: { type: Schema.Types.Mixed }
}, { _id: false });

// Schéma principal Project
const ProjectSchema = new Schema<IProjectDocument>({
  _id: { type: String }, // Utiliser String pour compatibilité avec IDs Firestore
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['web', 'mobile', 'iot', 'desktop'], 
    required: true 
  },
  constraints: [{ type: String }],
  teamSize: { type: String, required: true },
  scope: { type: String, required: true },
  budgetIntervals: { type: String },
  targets: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  selectedPhases: [{ type: String }],
  analysisResultModel: { type: Schema.Types.Mixed, default: {} },
  deployments: [{ type: Schema.Types.Mixed }],
  activeChatMessages: [ChatMessageSchema],
  policyAcceptance: { type: ProjectPolicyAcceptanceSchema },
  additionalInfos: {
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    country: { type: String },
    zipCode: { type: String },
    teamMembers: [TeamMemberSchema]
  }
}, {
  timestamps: true,
  collection: 'projects',
  toJSON: { 
    virtuals: true,
    transform: function(doc: any, ret: any) {
      ret.id = ret._id?.toString() || ret._id;
      delete ret._id;
      if (ret.__v !== undefined) delete ret.__v;
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc: any, ret: any) {
      ret.id = ret._id?.toString() || ret._id;
      delete ret._id;
      if (ret.__v !== undefined) delete ret.__v;
      return ret;
    }
  }
});

// Index pour optimiser les requêtes
ProjectSchema.index({ userId: 1, createdAt: -1 });
ProjectSchema.index({ name: 'text', description: 'text' });
ProjectSchema.index({ type: 1 });
ProjectSchema.index({ updatedAt: -1 });

// Méthodes statiques
ProjectSchema.statics.findByUserId = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

ProjectSchema.statics.findByUserIdAndType = function(userId: string, type: string) {
  return this.find({ userId, type }).sort({ createdAt: -1 });
};

// Middleware pre-save
ProjectSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.name = this.name.trim();
  }
  next();
});

export const Project = model<IProjectDocument>('Project', ProjectSchema);
