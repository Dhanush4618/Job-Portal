import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please enter a job title'],
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, 'Please enter the company name'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please enter the job location'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please enter a job description'],
    },
    requiredSkills: {
      type: [String],
      required: [true, 'Please specify the required skills'],
      default: [],
    },
    experienceLevel: {
      type: String,
      required: [true, 'Please specify the experience level'],
      enum: ['Entry', 'Mid', 'Senior', 'Lead'],
      default: 'Entry',
    },
    salaryRange: {
      type: String,
      required: [true, 'Please specify the salary range'],
      trim: true,
    },
    jobType: {
      type: String,
      required: [true, 'Please specify the job type'],
      enum: ['Full-time', 'Part-time', 'Internship', 'Remote'],
      default: 'Full-time',
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for text search
jobSchema.index({
  title: 'text',
  companyName: 'text',
  location: 'text',
  description: 'text',
});

const Job = mongoose.model('Job', jobSchema);
export default Job;
