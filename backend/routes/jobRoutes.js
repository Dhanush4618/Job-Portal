import express from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getRecruiterJobs,
} from '../controllers/jobController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public jobs routes
router.get('/', getJobs);
router.get('/recruiter/myjobs', protect, authorizeRoles('Recruiter'), getRecruiterJobs);
router.get('/:id', getJobById);

// Recruiter specific routes
router.post('/', protect, authorizeRoles('Recruiter'), createJob);
router.put('/:id', protect, authorizeRoles('Recruiter', 'Admin'), updateJob);
router.delete('/:id', protect, authorizeRoles('Recruiter', 'Admin'), deleteJob);

export default router;
