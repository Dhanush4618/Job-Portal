import dotenv from 'dotenv';
import mongoose from 'mongoose';

import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import SavedJob from '../models/SavedJob.js';

dotenv.config();

const seedData = async () => {
  try {
    const uri =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal';

    console.log(`Connecting to database for seeding: ${uri}`);

    await mongoose.connect(uri);

    // Clear existing data
    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await SavedJob.deleteMany({});

    console.log('Creating sample users...');

    // 1. Admin
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@jobportal.com',
      password: 'password123',
      role: 'Admin',
    });

    // 2. Recruiters
    const recruiter1 = await User.create({
      name: 'Sarah Connor',
      email: 'sarah@google.com',
      password: 'password123',
      role: 'Recruiter',
      companyName: 'Google',
      companyWebsite: 'https://google.com',
      companyDescription:
        'Google LLC is an American multinational technology company that specializes in Internet-related services and products.',
    });

    const recruiter2 = await User.create({
      name: 'John Doe',
      email: 'john@meta.com',
      password: 'password123',
      role: 'Recruiter',
      companyName: 'Meta',
      companyWebsite: 'https://meta.com',
      companyDescription:
        'Meta builds technologies that help people connect, find communities, and grow businesses.',
    });

    // 3. Candidates
    const candidate1 = await User.create({
      name: 'Alice Johnson',
      email: 'alice@candidate.com',
      password: 'password123',
      role: 'Candidate',
      bio: 'Enthusiastic full-stack engineer with 2+ years of experience building modern web apps.',
      skills: [
        'React',
        'Node.js',
        'Express',
        'MongoDB',
        'JavaScript',
        'CSS',
      ],
    });

    const candidate2 = await User.create({
      name: 'Bob Miller',
      email: 'bob@candidate.com',
      password: 'password123',
      role: 'Candidate',
      bio: 'Cloud architecture enthusiast and DevOps developer.',
      skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'],
    });

    console.log('Creating sample job listings...');

    const jobs = [
      {
        title: 'Senior Frontend Developer (React)',
        companyName: 'Google',
        location: 'Mountain View, CA',
        description: 'Frontend role...',
        requiredSkills: ['React', 'JavaScript', 'CSS', 'HTML'],
        experienceLevel: 'Senior',
        salaryRange: '$120,000 - $160,000',
        jobType: 'Full-time',
        recruiter: recruiter1._id,
      },
      {
        title: 'Junior Backend Engineer (Node/Express)',
        companyName: 'Google',
        location: 'Remote',
        description: 'Backend role...',
        requiredSkills: [
          'Node.js',
          'Express',
          'MongoDB',
          'JavaScript',
        ],
        experienceLevel: 'Entry',
        salaryRange: '$80,000 - $105,000',
        jobType: 'Remote',
        recruiter: recruiter1._id,
      },
      {
        title: 'DevOps Engineer (Kubernetes & AWS)',
        companyName: 'Meta',
        location: 'Seattle, WA',
        description: 'DevOps role...',
        requiredSkills: [
          'AWS',
          'Docker',
          'Kubernetes',
          'CI/CD',
          'Linux',
        ],
        experienceLevel: 'Senior',
        salaryRange: '$150,000 - $190,000',
        jobType: 'Full-time',
        recruiter: recruiter2._id,
      },
    ];

    await Job.insertMany(jobs);

    console.log('Sample database successfully seeded!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding process failed:', error.message);
    process.exit(1);
  }
};

seedData();