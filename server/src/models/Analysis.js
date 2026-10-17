import mongoose from 'mongoose';

const bulletImprovementSchema = new mongoose.Schema(
  {
    original: { type: String, required: true },
    improved: { type: String, required: true },
    reason: { type: String, required: true },
  },
  { _id: false }
);

const aiAnalysisSchema = new mongoose.Schema(
  {
    summary: { type: String, default: '' },
    missingSkills: [{ type: String }],
    optimizationTips: [{ type: String }],
    bulletImprovements: [bulletImprovementSchema],
  },
  { _id: false }
);

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      default: 'Resume Analysis',
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    resumeHash: {
      type: String,
      required: [true, 'Resume hash is required'],
    },
    jdSnippet: {
      type: String,
      required: [true, 'Job description snippet is required'],
      maxlength: 200,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    breakdown: {
      keyword: { type: Number, required: true, min: 0, max: 100 },
      sections: { type: Number, required: true, min: 0, max: 100 },
      readability: { type: Number, required: true, min: 0, max: 100 },
      impact: { type: Number, required: true, min: 0, max: 100 },
    },
    matched: [{ type: String }],
    missing: [{ type: String }],
    aiStatus: {
      type: String,
      enum: ['ok', 'unavailable'],
      default: 'ok',
      required: true,
    },
    ai: {
      type: aiAnalysisSchema,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for querying user history sorted by creation date descending
analysisSchema.index({ userId: 1, createdAt: -1 });

export const Analysis = mongoose.model('Analysis', analysisSchema);
export default Analysis;
