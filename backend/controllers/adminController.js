import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import SavedJob from '../models/SavedJob.js';

// @desc    Get all users in the system
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const roleFilter = req.query.role;
    const query = {};
    if (roleFilter && ['Candidate', 'Recruiter', 'Admin'].includes(roleFilter)) {
      query.role = roleFilter;
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all recruiters
// @route   GET /api/admin/recruiters
// @access  Private (Admin only)
const getAllRecruiters = async (req, res, next) => {
  try {
    const recruiters = await User.find({ role: 'Recruiter' }).sort({ createdAt: -1 });
    res.json(recruiters);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs in system (unsorted/unfiltered)
// @route   GET /api/admin/jobs
// @access  Private (Admin only)
const getAllJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({})
      .populate('recruiter', 'name email companyName')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get system-wide analytics using aggregation pipelines
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
const getDashboardAnalytics = async (req, res, next) => {
  try {
    // 1. User counts by role
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    // Format user stats
    const usersByRole = { Candidate: 0, Recruiter: 0, Admin: 0, total: 0 };
    userStats.forEach((stat) => {
      if (usersByRole[stat._id] !== undefined) {
        usersByRole[stat._id] = stat.count;
      }
    });
    usersByRole.total = usersByRole.Candidate + usersByRole.Recruiter + usersByRole.Admin;

    // 2. Job counts by JobType
    const jobStats = await Job.aggregate([
      {
        $group: {
          _id: '$jobType',
          count: { $sum: 1 },
        },
      },
    ]);

    const jobsByType = { 'Full-time': 0, 'Part-time': 0, Internship: 0, Remote: 0, total: 0 };
    let totalJobs = 0;
    jobStats.forEach((stat) => {
      if (jobsByType[stat._id] !== undefined) {
        jobsByType[stat._id] = stat.count;
      }
      totalJobs += stat.count;
    });
    jobsByType.total = totalJobs;

    // 3. Application status breakdown
    const applicationStats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const applicationsByStatus = { Pending: 0, Reviewed: 0, Accepted: 0, Rejected: 0, total: 0 };
    let totalApps = 0;
    applicationStats.forEach((stat) => {
      if (applicationsByStatus[stat._id] !== undefined) {
        applicationsByStatus[stat._id] = stat.count;
      }
      totalApps += stat.count;
    });
    applicationsByStatus.total = totalApps;

    // Send complete analytics package
    res.json({
      users: usersByRole,
      jobs: jobsByType,
      applications: applicationsByStatus,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Moderator endpoint to delete any job post
// @route   DELETE /api/admin/jobs/:id
// @access  Private (Admin only)
const deleteJobByAdmin = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404);
      throw new Error('Job listing not found');
    }

    // Delete matching applications as well to maintain DB integrity
    await Application.deleteMany({ job: job._id });
    await SavedJob.deleteMany({ job: job._id });

    await job.deleteOne();

    res.json({ message: 'Job listing moderated and deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export {
  getAllUsers,
  getAllRecruiters,
  getAllJobs,
  getDashboardAnalytics,
  deleteJobByAdmin,
};
