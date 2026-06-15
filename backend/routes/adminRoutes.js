import express from 'express';
import {
  getAllUsers,
  getAllRecruiters,
  getAllJobs,
  getDashboardAnalytics,
  deleteJobByAdmin,
} from '../controllers/adminController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Lock all admin routes to Admin role only
router.use(protect);
router.use(authorizeRoles('Admin'));

router.get('/users', getAllUsers);
router.get('/recruiters', getAllRecruiters);
router.get('/jobs', getAllJobs);
router.get('/analytics', getDashboardAnalytics);
router.delete('/jobs/:id', deleteJobByAdmin);

export default router;
