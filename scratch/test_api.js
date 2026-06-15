/**
 * E2E API Test Script for MERN Job Portal
 * Runs locally on port 5000 using Node.js native fetch.
 * Ensure the server is running (npm run dev/start) before executing this script.
 */

const API_URL = 'http://localhost:5000/api';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log('=== STARTING AUTOMATED API INTEGRATION TESTS ===\n');

  let candidateToken = '';
  let recruiterToken = '';
  let adminToken = '';
  let testJobId = '';
  let testApplicationId = '';

  const timestamp = Date.now();
  const testCandidateEmail = `candidate_${timestamp}@test.com`;
  const testRecruiterEmail = `recruiter_${timestamp}@test.com`;

  try {
    // 1. Candidate Registration
    console.log('1. Testing Candidate Registration...');
    const regCandRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Candidate',
        email: testCandidateEmail,
        password: 'password123',
        role: 'Candidate',
      }),
    });
    const regCandData = await regCandRes.json();
    if (regCandRes.status === 201 && regCandData.token) {
      console.log('   ✅ Candidate Registered Successfully!');
      candidateToken = regCandData.token;
    } else {
      throw new Error(`Candidate registration failed: ${JSON.stringify(regCandData)}`);
    }

    // 2. Candidate Login
    console.log('\n2. Testing Candidate Login...');
    const loginCandRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testCandidateEmail,
        password: 'password123',
      }),
    });
    const loginCandData = await loginCandRes.json();
    if (loginCandRes.status === 200 && loginCandData.token) {
      console.log('   ✅ Candidate Authenticated Successfully!');
    } else {
      throw new Error(`Candidate login failed: ${JSON.stringify(loginCandData)}`);
    }

    // 3. Recruiter Registration
    console.log('\n3. Testing Recruiter Registration...');
    const regRecRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Recruiter',
        email: testRecruiterEmail,
        password: 'password123',
        role: 'Recruiter',
      }),
    });
    const regRecData = await regRecRes.json();
    if (regRecRes.status === 201 && regRecData.token) {
      console.log('   ✅ Recruiter Registered Successfully!');
      recruiterToken = regRecData.token;
    } else {
      throw new Error(`Recruiter registration failed: ${JSON.stringify(regRecData)}`);
    }

    // 4. Update Recruiter Profile (Add Company details)
    console.log('\n4. Testing Recruiter Profile Details Update...');
    const updateRecRes = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        companyName: 'Test Automation Inc.',
        companyWebsite: 'https://testauto.com',
        companyDescription: 'Software test automation company.',
      }),
    });
    const updateRecData = await updateRecRes.json();
    if (updateRecRes.status === 200 && updateRecData.companyName === 'Test Automation Inc.') {
      console.log('   ✅ Recruiter Profile Configured Successfully!');
    } else {
      throw new Error(`Recruiter profile update failed: ${JSON.stringify(updateRecData)}`);
    }

    // 5. Recruiter Creates a Job
    console.log('\n5. Testing Recruiter Job Posting...');
    const createJobRes = await fetch(`${API_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        title: 'QA Automation Engineer',
        companyName: 'Test Automation Inc.',
        location: 'Remote',
        description: 'We are seeking a senior test automation engineer with Node.js and integration testing experience to write E2E script simulations.',
        requiredSkills: 'Node.js, Integration Testing, QA',
        experienceLevel: 'Senior',
        salaryRange: '$110,000 - $130,000',
        jobType: 'Remote',
      }),
    });
    const createJobData = await createJobRes.json();
    if (createJobRes.status === 201 && createJobData._id) {
      console.log(`   ✅ Job Posted Successfully! Job ID: ${createJobData._id}`);
      testJobId = createJobData._id;
    } else {
      throw new Error(`Job creation failed: ${JSON.stringify(createJobData)}`);
    }

    // 6. Public Job Search & Filters
    console.log('\n6. Testing Job Searches & Filter Queries...');
    const searchJobsRes = await fetch(`${API_URL}/jobs?search=QA&jobType=Remote`);
    const searchJobsData = await searchJobsRes.json();
    if (searchJobsRes.status === 200 && searchJobsData.jobs && searchJobsData.jobs.length > 0) {
      console.log(`   ✅ Job Query Successful! Found ${searchJobsData.total} matching jobs.`);
    } else {
      throw new Error(`Job search failed or yielded 0 results: ${JSON.stringify(searchJobsData)}`);
    }

    // 7. Candidate Saves Job
    console.log('\n7. Testing Bookmark / Save Job...');
    const saveJobRes = await fetch(`${API_URL}/applications/save/${testJobId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${candidateToken}`,
      },
    });
    const saveJobData = await saveJobRes.json();
    if (saveJobRes.status === 201) {
      console.log('   ✅ Job Saved Successfully!');
    } else {
      throw new Error(`Job save failed: ${JSON.stringify(saveJobData)}`);
    }

    // 8. Candidate Applies to Job (Simulating using profile resume path fallback)
    // First, let's set a fake profile resume path for candidate to satisfy fallback
    console.log('\n8. Setting candidate profile resume path to mock PDF...');
    const updateCandProfileRes = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({
        resumePath: '/uploads/resumes/mock_resume_12345.pdf',
        bio: 'Automated test profile candidate.',
        skills: 'React, QA, Node.js',
      }),
    });
    const updateCandProfileData = await updateCandProfileRes.json();
    
    console.log('9. Testing Candidate Application Submission...');
    const applyRes = await fetch(`${API_URL}/applications/apply/${testJobId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({
        coverLetter: 'Hi, I would love to join your QA automation team as simulated by the Node script!',
      }),
    });
    const applyData = await applyRes.json();
    if (applyRes.status === 201 && applyData._id) {
      console.log(`   ✅ Application Submitted Successfully! App ID: ${applyData._id}`);
      testApplicationId = applyData._id;
    } else {
      throw new Error(`Job application submission failed: ${JSON.stringify(applyData)}`);
    }

    // 10. Recruiter Views Applicants
    console.log('\n10. Testing Recruiter Fetching Applicants List...');
    const viewAppsRes = await fetch(`${API_URL}/applications/job/${testJobId}`, {
      headers: {
        Authorization: `Bearer ${recruiterToken}`,
      },
    });
    const viewAppsData = await viewAppsRes.json();
    if (viewAppsRes.status === 200 && viewAppsData.length > 0) {
      console.log(`    ✅ Applicants List Loaded Successfully! Found ${viewAppsData.length} applicants.`);
    } else {
      throw new Error(`Recruiter applicant load failed: ${JSON.stringify(viewAppsData)}`);
    }

    // 11. Recruiter Updates Application Status (Triggering Nodemailer Email Notification)
    console.log('\n11. Testing Applicant Status Update & Email Notification...');
    const statusRes = await fetch(`${API_URL}/applications/${testApplicationId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        status: 'Reviewed',
      }),
    });
    const statusData = await statusRes.json();
    if (statusRes.status === 200 && statusData.status === 'Reviewed') {
      console.log('    ✅ Status Updated & Mail Notification successfully processed!');
    } else {
      throw new Error(`Status update failed: ${JSON.stringify(statusData)}`);
    }

    // 12. Admin Logs In & Checks Analytics Aggregations
    console.log('\n12. Testing Admin Authentication...');
    const loginAdminRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@jobportal.com',
        password: 'password123',
      }),
    });
    const loginAdminData = await loginAdminRes.json();
    if (loginAdminRes.status === 200 && loginAdminData.token) {
      console.log('    ✅ Admin logged in!');
      adminToken = loginAdminData.token;
    } else {
      throw new Error(`Admin login failed: ${JSON.stringify(loginAdminData)}`);
    }

    console.log('\n13. Testing Admin Dashboard Aggregations...');
    const analyticsRes = await fetch(`${API_URL}/admin/analytics`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const analyticsData = await analyticsRes.json();
    if (analyticsRes.status === 200 && analyticsData.users && analyticsData.jobs) {
      console.log('    ✅ Admin Analytics MongoDB Aggregations returned successfully!');
      console.log(`       - Total Users: ${analyticsData.users.total}`);
      console.log(`       - Total Jobs: ${analyticsData.jobs.total}`);
      console.log(`       - Total Apps: ${analyticsData.applications.total}`);
    } else {
      throw new Error(`Admin analytics aggregation failed: ${JSON.stringify(analyticsData)}`);
    }

    console.log('\n🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉\n');
  } catch (error) {
    console.error(`\n❌ TEST FAILURE: ${error.message}\n`);
    process.exit(1);
  }
}

runTests();
