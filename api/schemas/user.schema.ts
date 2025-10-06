import { Schema, model, Document } from 'mongoose';
import { UserModel, QuotaData, GitHubIntegration, RefreshTokenData, PolicyAcceptanceStatus } from '../models/userModel';

// Interface pour le document Mongoose
export interface IUserDocument extends Omit<UserModel, 'uid'>, Document {
  _id: string;
}

// Sous-schémas
const QuotaDataSchema = new Schema<QuotaData>({
  dailyUsage: { type: Number, default: 0 },
  weeklyUsage: { type: Number, default: 0 },
  dailyLimit: { type: Number, required: true },
  weeklyLimit: { type: Number, required: true },
  lastResetDaily: { type: String, required: true },
  lastResetWeekly: { type: String, required: true },
  quotaUpdatedAt: { type: Date }
}, { _id: false });

const GitHubIntegrationSchema = new Schema<GitHubIntegration>({
  accessToken: { type: String, required: true },
  refreshToken: { type: String },
  username: { type: String, required: true },
  avatarUrl: { type: String },
  connectedAt: { type: Date, required: true },
  lastUsed: { type: Date },
  scopes: [{ type: String }]
}, { _id: false });

const RefreshTokenDataSchema = new Schema<RefreshTokenData>({
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, required: true },
  lastUsed: { type: Date },
  deviceInfo: { type: String },
  ipAddress: { type: String }
}, { _id: false });

const PolicyAcceptanceStatusSchema = new Schema<PolicyAcceptanceStatus>({
  privacyPolicy: { type: Boolean, required: true },
  termsOfService: { type: Boolean, required: true },
  betaPolicy: { type: Boolean, required: true },
  marketingAcceptance: { type: Boolean },
  lastAcceptedAt: { type: Date },
  ipAddress: { type: String },
  userAgent: { type: String }
}, { _id: false });

// Schéma principal User
const UserSchema = new Schema<IUserDocument>({
  _id: { type: String, required: true }, // uid Firebase comme _id
  email: { type: String, required: true, lowercase: true, trim: true },
  displayName: { type: String, trim: true },
  photoURL: { type: String },
  subscription: { 
    type: String, 
    enum: ['free', 'pro', 'enterprise'], 
    default: 'free',
    required: true 
  },
  createdAt: { type: Date, default: Date.now, required: true },
  lastLogin: { type: Date, default: Date.now, required: true },
  quota: { type: QuotaDataSchema, default: {} },
  roles: [{ type: String, default: ['user'] }],
  githubIntegration: { type: GitHubIntegrationSchema },
  refreshTokens: [{ type: RefreshTokenDataSchema }],
  policyAcceptance: { type: PolicyAcceptanceStatusSchema }
}, {
  timestamps: true,
  collection: 'users',
  toJSON: { 
    virtuals: true,
    transform: function(doc: any, ret: any) {
      ret.uid = ret._id;
      delete ret._id;
      if (ret.__v !== undefined) delete ret.__v;
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc: any, ret: any) {
      ret.uid = ret._id;
      delete ret._id;
      if (ret.__v !== undefined) delete ret.__v;
      return ret;
    }
  }
});

// Index pour optimiser les requêtes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ lastLogin: -1 });
UserSchema.index({ subscription: 1 });

// Méthodes d'instance
UserSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Méthodes statiques
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Middleware pre-save pour validation
UserSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

export const User = model<IUserDocument>('User', UserSchema);
