import express from 'express';
import {
  applyToJob,
  getCandidateApplications,
  getJobApplicants,
  updateApplicationStatus,
  downloadResume,
  saveJob,
  unsaveJob,
  getSavedJobs,
} from '../controllers/applicationController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import uploadResume from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Candidate routes
router.post('/apply/:jobId', protect, authorizeRoles('Candidate'), uploadResume.single('resume'), applyToJob);
router.get('/myapplications', protect, authorizeRoles('Candidate'), getCandidateApplications);
router.post('/save/:jobId', protect, authorizeRoles('Candidate'), saveJob);
router.delete('/save/:jobId', protect, authorizeRoles('Candidate'), unsaveJob);
router.get('/savedjobs', protect, authorizeRoles('Candidate'), getSavedJobs);

// Recruiter & Admin routes
router.get('/job/:jobId', protect, authorizeRoles('Recruiter', 'Admin'), getJobApplicants);
router.put('/:id/status', protect, authorizeRoles('Recruiter', 'Admin'), updateApplicationStatus);

// Resume download (accessible by Candidate owner, Recruiter of job, or Admin)
router.get('/resume/download/:filename', protect, downloadResume);

export default router;
