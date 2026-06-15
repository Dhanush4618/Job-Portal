import Application from '../models/Application.js';
import Job from '../models/Job.js';
import SavedJob from '../models/SavedJob.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/email.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Reconstruct __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Apply to a job
// @route   POST /api/applications/apply/:jobId
// @access  Private (Candidate only)
const applyToJob = async (req, res, next) => {
  try {
    const { coverLetter } = req.body;
    const jobId = req.params.jobId;

    // Check if job exists
    const job = await Job.findById(jobId).populate('recruiter', 'email');
    if (!job) {
      res.status(404);
      throw new Error('Job listing not found');
    }

    // Check if candidate already applied
    const alreadyApplied = await Application.findOne({
      candidate: req.user._id,
      job: jobId,
    });
    if (alreadyApplied) {
      res.status(400);
      throw new Error('You have already applied for this job');
    }

    // Resolve resume path: uploaded file or fallback to profile
    let resumePath = '';
    if (req.file) {
      resumePath = `/uploads/resumes/${req.file.filename}`;
      // Automatically save to user profile if they don't have one yet
      if (!req.user.resumePath) {
        req.user.resumePath = resumePath;
        await req.user.save();
      }
    } else if (req.user.resumePath) {
      resumePath = req.user.resumePath;
    } else {
      res.status(400);
      throw new Error('Please upload a resume (PDF format) to apply');
    }

    // Create application
    const application = await Application.create({
      candidate: req.user._id,
      job: jobId,
      coverLetter: coverLetter || '',
      resumePath,
    });

    // Send confirmation email to candidate
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #6366f1;">Application Received!</h2>
        <p>Hi ${req.user.name},</p>
        <p>Your application for the position of <strong>${job.title}</strong> at <strong>${job.companyName}</strong> has been successfully submitted.</p>
        <p><strong>Status:</strong> Pending</p>
        <p>The recruiter will review your profile and contact you directly if there is a match.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888;">This is an automated notification from the Job Portal application.</p>
      </div>
    `;

    // Fire email asynchronously (won't block HTTP response)
    sendEmail({
      to: req.user.email,
      subject: `Application Submitted: ${job.title} at ${job.companyName}`,
      html: emailHtml,
    });

    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications for candidate
// @route   GET /api/applications/myapplications
// @access  Private (Candidate only)
const getCandidateApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate({
        path: 'job',
        populate: { path: 'recruiter', select: 'name email companyName' },
      })
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Get applicants for a job
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiter only)
const getJobApplicants = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;

    // Verify job belongs to recruiter
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404);
      throw new Error('Job listing not found');
    }

    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      res.status(403);
      throw new Error('Not authorized to view applicants for this job');
    }

    const applicants = await Application.find({ job: jobId })
      .populate('candidate', 'name email bio skills resumePath')
      .sort({ createdAt: -1 });

    res.json(applicants);
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Recruiter only)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;

    if (!['Pending', 'Reviewed', 'Accepted', 'Rejected'].includes(status)) {
      res.status(400);
      throw new Error('Invalid application status');
    }

    // Get application and populate job & candidate details
    const application = await Application.findById(applicationId)
      .populate('job')
      .populate('candidate', 'name email');

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    // Verify job belongs to recruiter
    if (
      application.job.recruiter.toString() !== req.user._id.toString() &&
      req.user.role !== 'Admin'
    ) {
      res.status(403);
      throw new Error('Not authorized to update this application status');
    }

    application.status = status;
    await application.save();

    // Send email alert to Candidate
    let statusColor = '#3b82f6'; // Blue for reviewed
    if (status === 'Accepted') statusColor = '#10b981'; // Green
    if (status === 'Rejected') statusColor = '#ef4444'; // Red

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #6366f1;">Application Status Updated</h2>
        <p>Hi ${application.candidate.name},</p>
        <p>The status of your application for <strong>${application.job.title}</strong> at <strong>${application.job.companyName}</strong> has been updated to:</p>
        <div style="display: inline-block; padding: 10px 20px; font-weight: bold; color: white; background-color: ${statusColor}; border-radius: 4px; margin: 15px 0;">
          ${status}
        </div>
        <p>Please check the candidate dashboard for any comments or updates.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888;">This is an automated notification from the Job Portal application.</p>
      </div>
    `;

    sendEmail({
      to: application.candidate.email,
      subject: `Application Update: ${application.job.title} - ${status}`,
      html: emailHtml,
    });

    res.json(application);
  } catch (error) {
    next(error);
  }
};

// @desc    Download Candidate Resume
// @route   GET /api/applications/resume/download/:filename
// @access  Private (Recruiter / Admin / Candidate Owner)
const downloadResume = async (req, res, next) => {
  try {
    const filename = req.params.filename;

    // Resolve full path
    const filePath = path.join(__dirname, '../uploads/resumes', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      res.status(404);
      throw new Error('Resume file not found on server');
    }

    // Authenticate: Ensure req.user is Candidate who owns it, or a Recruiter, or Admin
    if (req.user.role === 'Candidate') {
      const pathToken = `/uploads/resumes/${filename}`;
      // Verify if they own it (either in profile or in one of their applications)
      const isOwner = req.user.resumePath === pathToken;
      const appliedWithOwner = await Application.exists({
        candidate: req.user._id,
        resumePath: pathToken,
      });

      if (!isOwner && !appliedWithOwner) {
        res.status(403);
        throw new Error('Not authorized to access this file');
      }
    }

    // Download/Send file
    res.download(filePath, filename);
  } catch (error) {
    next(error);
  }
};

// @desc    Save a job for later
// @route   POST /api/applications/save/:jobId
// @access  Private (Candidate only)
const saveJob = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;

    // Check if job exists
    const jobExists = await Job.exists({ _id: jobId });
    if (!jobExists) {
      res.status(404);
      throw new Error('Job listing not found');
    }

    // Check if already bookmarked
    const alreadySaved = await SavedJob.findOne({
      candidate: req.user._id,
      job: jobId,
    });

    if (alreadySaved) {
      res.status(400);
      throw new Error('You have already saved this job');
    }

    const savedJob = await SavedJob.create({
      candidate: req.user._id,
      job: jobId,
    });

    res.status(201).json(savedJob);
  } catch (error) {
    next(error);
  }
};

// @desc    Unsave a job
// @route   DELETE /api/applications/save/:jobId
// @access  Private (Candidate only)
const unsaveJob = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;

    const savedJob = await SavedJob.findOne({
      candidate: req.user._id,
      job: jobId,
    });

    if (!savedJob) {
      res.status(404);
      throw new Error('Saved job not found');
    }

    await savedJob.deleteOne();
    res.json({ message: 'Job unsaved successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all saved jobs
// @route   GET /api/applications/savedjobs
// @access  Private (Candidate only)
const getSavedJobs = async (req, res, next) => {
  try {
    const savedJobs = await SavedJob.find({ candidate: req.user._id })
      .populate({
        path: 'job',
        populate: { path: 'recruiter', select: 'companyName location' }
      })
      .sort({ createdAt: -1 });

    res.json(savedJobs);
  } catch (error) {
    next(error);
  }
};

export {
  applyToJob,
  getCandidateApplications,
  getJobApplicants,
  updateApplicationStatus,
  downloadResume,
  saveJob,
  unsaveJob,
  getSavedJobs,
};
