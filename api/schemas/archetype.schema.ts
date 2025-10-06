import { Schema, model, Document } from 'mongoose';
import { ArchetypeModel, TerraformVariable } from '../models/archetypes.model';

// Interface pour le document Mongoose
export interface IArchetypeDocument extends Document {
  name: string;
  description: string;
  provider: 'aws' | 'gcp' | 'azure';
  category: string;
  tags: string[];
  icon?: string;
  terraformVariables: TerraformVariable[];
  estimatedCost?: {
    monthly?: number;
    currency?: string;
  };
  complexity?: 'beginner' | 'intermediate' | 'advanced';
  userId: string;
}

// Sous-schéma pour TerraformVariable
const TerraformVariableSchema = new Schema<TerraformVariable>({
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  default: { type: Schema.Types.Mixed },
  required: { type: Boolean, default: false },
  sensitive: { type: Boolean, default: false },
  validation: { type: Schema.Types.Mixed }
}, { _id: false });

// Schéma principal Archetype
const ArchetypeSchema = new Schema<IArchetypeDocument>({
  _id: { type: String }, // Utiliser String pour compatibilité avec IDs Firestore
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  provider: { 
    type: String, 
    enum: ['aws', 'gcp', 'azure'], 
    required: true 
  },
  category: { type: String, required: true, trim: true },
  tags: [{ type: String }],
  icon: { type: String },
  terraformVariables: [TerraformVariableSchema],
  estimatedCost: { type: Schema.Types.Mixed },
  complexity: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'], 
    default: 'intermediate' 
  },
  userId: { type: String, required: true }
}, {
  timestamps: true,
  collection: 'archetypes',
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
ArchetypeSchema.index({ userId: 1, provider: 1 });
ArchetypeSchema.index({ category: 1 });
ArchetypeSchema.index({ tags: 1 });
ArchetypeSchema.index({ name: 'text', description: 'text' });
ArchetypeSchema.index({ complexity: 1 });

// Méthodes statiques
ArchetypeSchema.statics.findByProvider = function(userId: string, provider: string) {
  return this.find({ userId, provider } as any).sort({ name: 1 });
};

ArchetypeSchema.statics.findByCategory = function(userId: string, category: string) {
  return this.find({ userId, category } as any).sort({ name: 1 });
};

ArchetypeSchema.statics.findByComplexity = function(userId: string, complexity: string) {
  return this.find({ userId, complexity } as any).sort({ name: 1 });
};

export const Archetype = model<IArchetypeDocument>('Archetype', ArchetypeSchema);
