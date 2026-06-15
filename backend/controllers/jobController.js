import Job from '../models/Job.js';

// @desc    Get all jobs (public, with filters & pagination)
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const query = {};

    // 1. Keyword search (regex fallback for partial matches)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { title: searchRegex },
        { companyName: searchRegex },
        { location: searchRegex },
        { requiredSkills: searchRegex },
        { description: searchRegex },
      ];
    }

    // 2. Specific filters
    if (req.query.location) {
      query.location = new RegExp(req.query.location, 'i');
    }

    if (req.query.experienceLevel) {
      query.experienceLevel = req.query.experienceLevel;
    }

    if (req.query.jobType) {
      query.jobType = req.query.jobType;
    }

    // 3. Skills filter (comma separated)
    if (req.query.skills) {
      const skillsArray = req.query.skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      if (skillsArray.length > 0) {
        const skillsRegexes = skillsArray.map(s => new RegExp(s, 'i'));
        query.requiredSkills = { $in: skillsRegexes };
      }
    }

    // Get total count of matching jobs
    const totalJobs = await Job.countDocuments(query);
    const totalPages = Math.ceil(totalJobs / limit);

    // Fetch jobs
    const jobs = await Job.find(query)
      .populate('recruiter', 'name email companyName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      jobs,
      page,
      pages: totalPages,
      total: totalJobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job details
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'recruiter',
      'name email companyName companyWebsite companyDescription'
    );

    if (!job) {
      res.status(404);
      throw new Error('Job post not found');
    }

    res.json(job);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a job post
// @route   POST /api/jobs
// @access  Private (Recruiter only)
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      companyName,
      location,
      description,
      requiredSkills,
      experienceLevel,
      salaryRange,
      jobType,
    } = req.body;

    if (
      !title ||
      !companyName ||
      !location ||
      !description ||
      !experienceLevel ||
      !salaryRange ||
      !jobType
    ) {
      res.status(400);
      throw new Error('Please fill in all required job fields');
    }

    // Process skills if passed as string or array
    let skills = [];
    if (requiredSkills) {
      if (Array.isArray(requiredSkills)) {
        skills = requiredSkills;
      } else if (typeof requiredSkills === 'string') {
        skills = requiredSkills
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }
    }

    const job = await Job.create({
      title,
      companyName,
      location,
      description,
      requiredSkills: skills,
      experienceLevel,
      salaryRange,
      jobType,
      recruiter: req.user._id,
    });

    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job post
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter who posted it, or Admin)
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404);
      throw new Error('Job post not found');
    }

    // Verify ownership or check if Admin
    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      res.status(403);
      throw new Error('Not authorized to modify this job listing');
    }

    job.title = req.body.title || job.title;
    job.companyName = req.body.companyName || job.companyName;
    job.location = req.body.location || job.location;
    job.description = req.body.description || job.description;
    job.experienceLevel = req.body.experienceLevel || job.experienceLevel;
    job.salaryRange = req.body.salaryRange || job.salaryRange;
    job.jobType = req.body.jobType || job.jobType;

    if (req.body.requiredSkills !== undefined) {
      if (Array.isArray(req.body.requiredSkills)) {
        job.requiredSkills = req.body.requiredSkills;
      } else if (typeof req.body.requiredSkills === 'string') {
        job.requiredSkills = req.body.requiredSkills
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }
    }

    const updatedJob = await job.save();
    res.json(updatedJob);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job post
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter who posted it, or Admin)
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404);
      throw new Error('Job post not found');
    }

    // Verify ownership or check if Admin
    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      res.status(403);
      throw new Error('Not authorized to delete this job listing');
    }

    await job.deleteOne();
    res.json({ message: 'Job listing deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs posted by the logged-in Recruiter
// @route   GET /api/jobs/recruiter/myjobs
// @access  Private (Recruiter only)
const getRecruiterJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

export {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getRecruiterJobs,
};
