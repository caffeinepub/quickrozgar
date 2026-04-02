import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Array "mo:core/Array";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile (required by frontend)
  public type UserProfile = {
    profileType : { #worker; #employer };
  };

  // Profiles - Worker
  type WorkerProfile = {
    name : Text;
    skills : [Text];
    location : Text;
    experience : Nat;
  };
  module WorkerProfile {
    public func compare(profile1 : WorkerProfile, profile2 : WorkerProfile) : Order.Order {
      Text.compare(profile1.name, profile2.name);
    };
  };

  // Profiles - Employer
  type EmployerProfile = {
    companyName : Text;
    description : Text;
    location : Text;
    industry : Text;
  };
  module EmployerProfile {
    public func compare(profile1 : EmployerProfile, profile2 : EmployerProfile) : Order.Order {
      Text.compare(profile1.companyName, profile2.companyName);
    };
  };

  // Job Listing
  type JobListing = {
    id : Nat;
    title : Text;
    company : Text;
    location : Text;
    salary : Text;
    category : Text;
    description : Text;
    employerId : Principal;
    approved : Bool;
  };
  module JobListing {
    public func compare(listing1 : JobListing, listing2 : JobListing) : Order.Order {
      Nat.compare(listing1.id, listing2.id);
    };
  };

  // Job Application
  type JobApplication = {
    id : Nat;
    workerId : Principal;
    worker : WorkerProfile;
    job : JobListing;
    status : Text;
  };
  module JobApplication {
    public func compare(application1 : JobApplication, application2 : JobApplication) : Order.Order {
      Nat.compare(application1.id, application2.id);
    };
  };

  // Course
  type Course = {
    id : Nat;
    title : Text;
    description : Text;
  };
  module Course {
    public func compare(course1 : Course, course2 : Course) : Order.Order {
      Nat.compare(course1.id, course2.id);
    };
  };

  // Admin Stats
  type AdminStats = {
    totalUsers : Nat;
    totalEmployers : Nat;
    totalJobs : Nat;
    totalApplications : Nat;
    activeJobs : Nat; // Number of approved jobs
  };

  // Recent Activity
  type RecentActivity = {
    recentJobs : [JobListing];
    recentApplications : [JobApplication];
  };

  // Employer Activity
  type EmployerActivity = {
    employer : Principal;
    profile : EmployerProfile;
    jobsPosted : Nat;
    totalApplicants : Nat;
    plan : Text;
  };

  // Id counters
  var nextJobId = 0;
  var nextCourseId = 0;
  var nextApplicationId = 0;

  // Data storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  let workerProfiles = Map.empty<Principal, WorkerProfile>();
  let employerProfiles = Map.empty<Principal, EmployerProfile>();
  let jobListings = Map.empty<Nat, JobListing>();
  let applications = Map.empty<Nat, JobApplication>();
  let courses = Map.empty<Nat, Course>();
  let blockedUsers = Map.empty<Principal, Bool>();
  let employerPlans = Map.empty<Principal, Text>();

  // Authorization helpers
  func assertAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  func assertNotBlocked(caller : Principal) {
    if (blockedUsers.containsKey(caller)) {
      Runtime.trap("Unauthorized: Your account has been blocked");
    };
  };

  func assertUserNotBlocked(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be signed in as a user");
    };
    assertNotBlocked(caller);
  };

  // Required user profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    assertUserNotBlocked(caller);
    userProfiles.add(caller, profile);
  };

  // Profiles - Worker
  public shared ({ caller }) func saveWorkerProfile(name : Text, skills : [Text], location : Text, experience : Nat) : async () {
    assertUserNotBlocked(caller);
    let profile = {
      name;
      skills;
      location;
      experience;
    };
    workerProfiles.add(caller, profile);
    // Update user profile type
    let userProfile = {
      profileType = #worker;
    };
    userProfiles.add(caller, userProfile);
  };

  public query ({ caller }) func getWorkerProfile(user : Principal) : async ?WorkerProfile {
    // Workers can view their own profile, employers can view worker profiles (to evaluate applicants), admins can view any profile
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      // Check if caller is a user (not guest) - employers need to be logged in to view worker profiles
      if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
        Runtime.trap("Unauthorized: You must be signed in to view worker profiles");
      };
    };
    workerProfiles.get(user);
  };

  // Profiles - Employer
  public shared ({ caller }) func saveEmployerProfile(companyName : Text, description : Text, location : Text, industry : Text) : async () {
    assertUserNotBlocked(caller);
    let profile = {
      companyName;
      description;
      location;
      industry;
    };
    employerProfiles.add(caller, profile);
    // Update user profile type
    let userProfile = {
      profileType = #employer;
    };
    userProfiles.add(caller, userProfile);
  };

  public query ({ caller }) func getEmployerProfile(user : Principal) : async ?EmployerProfile {
    // Employers can view their own profile, workers can view employer profiles (to learn about companies), admins can view any profile
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      // Check if caller is a user (not guest) - workers need to be logged in to view employer profiles
      if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
        Runtime.trap("Unauthorized: You must be signed in to view employer profiles");
      };
    };
    employerProfiles.get(user);
  };

  // Job Listings
  public shared ({ caller }) func createJobListing(title : Text, company : Text, location : Text, salary : Text, category : Text, description : Text) : async Nat {
    assertUserNotBlocked(caller);
    assert nextJobId < 2 ** 30; // Prevent overflow
    let jobId = nextJobId;
    let job = {
      id = jobId;
      title;
      company;
      location;
      salary;
      category;
      description;
      employerId = caller;
      approved = false;
    };
    jobListings.add(jobId, job);
    nextJobId += 1;
    jobId;
  };

  public shared ({ caller }) func updateJobListing(jobId : Nat, title : Text, company : Text, location : Text, salary : Text, category : Text, description : Text) : async () {
    assertUserNotBlocked(caller);
    switch (jobListings.get(jobId)) {
      case (null) { Runtime.trap("Job listing not found") };
      case (?existingJob) {
        // Only the employer who created the job or an admin can update it
        if (existingJob.employerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the job creator or admin can update this listing");
        };
        let job = {
          id = jobId;
          title;
          company;
          location;
          salary;
          category;
          description;
          employerId = existingJob.employerId;
          approved = existingJob.approved;
        };
        jobListings.add(jobId, job);
      };
    };
  };

  public shared ({ caller }) func deleteJobListing(jobId : Nat) : async () {
    assertUserNotBlocked(caller);
    switch (jobListings.get(jobId)) {
      case (null) { Runtime.trap("Job listing not found") };
      case (?existingJob) {
        // Only the employer who created the job or an admin can delete it
        if (existingJob.employerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the job creator or admin can delete this listing");
        };
        jobListings.remove(jobId);
      };
    };
  };

  // Job Applications
  public shared ({ caller }) func applyToJob(jobId : Nat) : async Nat {
    assertUserNotBlocked(caller);
    // Check for duplicate application
    let hasAlreadyApplied = applications.any(
      func(_id, app) { app.workerId == caller and app.job.id == jobId }
    );
    if (hasAlreadyApplied) {
      Runtime.trap("You have already applied to this job");
    };
    switch (workerProfiles.get(caller)) {
      case (null) { Runtime.trap("Worker profile not found. Please create a worker profile first.") };
      case (?workerProfile) {
        switch (jobListings.get(jobId)) {
          case (null) { Runtime.trap("Job listing not found") };
          case (?jobListing) {
            // Workers cannot apply to their own job listings
            if (jobListing.employerId == caller) {
              Runtime.trap("Unauthorized: You cannot apply to your own job listing");
            };
            assert nextApplicationId < 2 ** 30;
            let applicationId = nextApplicationId;
            let application : JobApplication = {
              id = applicationId;
              workerId = caller;
              worker = workerProfile;
              job = jobListing;
              status = "Pending";
            };
            applications.add(applicationId, application);
            nextApplicationId += 1;
            applicationId;
          };
        };
      };
    };
  };

  public shared ({ caller }) func updateApplicationStatus(applicationId : Nat, newStatus : Text) : async () {
    assertUserNotBlocked(caller);
    switch (applications.get(applicationId)) {
      case (null) { Runtime.trap("Application not found") };
      case (?app) {
        // Only the employer who owns the job or an admin can update application status
        if (app.job.employerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the job owner or admin can update application status");
        };
        let updatedApp = {
          id = app.id;
          workerId = app.workerId;
          worker = app.worker;
          job = app.job;
          status = newStatus;
        };
        applications.add(applicationId, updatedApp);
      };
    };
  };

  // Courses
  public shared ({ caller }) func createCourse(title : Text, description : Text) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create courses");
    };
    assert nextCourseId < 2 ** 30;
    let courseId = nextCourseId;
    let course = {
      id = courseId;
      title;
      description;
    };
    courses.add(courseId, course);
    nextCourseId += 1;
    courseId;
  };

  public shared ({ caller }) func updateCourse(courseId : Nat, title : Text, description : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update courses");
    };
    switch (courses.get(courseId)) {
      case (null) { Runtime.trap("Course not found") };
      case (?_) {
        let course = {
          id = courseId;
          title;
          description;
        };
        courses.add(courseId, course);
      };
    };
  };

  public shared ({ caller }) func deleteCourse(courseId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete courses");
    };
    courses.remove(courseId);
  };

  // Query functions
  public query ({ caller }) func getAllJobs() : async [JobListing] {
    // Public access - but non-admins only see approved jobs
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let filteredJobs = List.empty<JobListing>();
    for ((id, listing) in jobListings.entries()) {
      if (isAdmin or listing.approved) {
        filteredJobs.add(listing);
      };
    };
    filteredJobs.toArray().sort();
  };

  public query ({ caller }) func getMyApplications() : async [JobApplication] {
    assertUserNotBlocked(caller);
    // Workers can only see their own applications
    let myApps = List.empty<JobApplication>();
    for ((id, app) in applications.entries()) {
      if (app.workerId == caller) {
        myApps.add(app);
      };
    };
    myApps.toArray().sort();
  };

  public query ({ caller }) func getJobApplications(jobId : Nat) : async [JobApplication] {
    assertUserNotBlocked(caller);
    // Verify the caller owns this job listing
    switch (jobListings.get(jobId)) {
      case (null) { Runtime.trap("Job listing not found") };
      case (?job) {
        if (job.employerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the job owner or admin can view applications");
        };
        let jobApps = List.empty<JobApplication>();
        for ((id, app) in applications.entries()) {
          if (app.job.id == jobId) {
            jobApps.add(app);
          };
        };
        jobApps.toArray().sort();
      };
    };
  };

  public query ({ caller }) func getAllCourses() : async [Course] {
    // Public access - anyone can view courses
    courses.toArray().map(func((id, course)) { course }).sort();
  };

  public query ({ caller }) func getCourse(courseId : Nat) : async ?Course {
    // Public access - anyone can view a specific course
    courses.get(courseId);
  };

  public query ({ caller }) func getJob(jobId : Nat) : async ?JobListing {
    // Public access - but non-admins can only view approved jobs
    switch (jobListings.get(jobId)) {
      case (null) { null };
      case (?job) {
        let isAdmin = AccessControl.isAdmin(accessControlState, caller);
        if (isAdmin or job.approved) {
          ?job;
        } else {
          null;
        };
      };
    };
  };

  // Admin queries
  public query ({ caller }) func adminGetAllWorkers() : async [(Principal, WorkerProfile)] {
    assertAdmin(caller);
    workerProfiles.toArray();
  };

  public query ({ caller }) func adminGetAllEmployers() : async [(Principal, EmployerProfile)] {
    assertAdmin(caller);
    employerProfiles.toArray();
  };

  public query ({ caller }) func adminGetAllApplications() : async [JobApplication] {
    assertAdmin(caller);
    applications.toArray().map(func((id, app)) { app }).sort();
  };

  public query ({ caller }) func adminGetStats() : async AdminStats {
    assertAdmin(caller);
    let activeJobs = jobListings.size();
    let result = jobListings.toArray().foldLeft(
      0,
      func(activeJobs, (_, job)) {
        if (job.approved) { activeJobs + 1 } else { activeJobs };
      },
    );
    {
      totalUsers = userProfiles.size();
      totalEmployers = employerProfiles.size();
      totalJobs = jobListings.size();
      totalApplications = applications.size();
      activeJobs = result;
    };
  };

  // Admin actions
  public shared ({ caller }) func adminBlockUser(user : Principal) : async () {
    assertAdmin(caller);
    blockedUsers.add(user, true);
  };

  public shared ({ caller }) func adminUnblockUser(user : Principal) : async () {
    assertAdmin(caller);
    blockedUsers.remove(user);
  };

  public shared ({ caller }) func adminDeleteWorker(user : Principal) : async () {
    assertAdmin(caller);
    workerProfiles.remove(user);
    userProfiles.remove(user);
  };

  public shared ({ caller }) func adminDeleteEmployer(user : Principal) : async () {
    assertAdmin(caller);
    employerProfiles.remove(user);
    userProfiles.remove(user);
  };

  public shared ({ caller }) func adminApproveJob(jobId : Nat) : async () {
    assertAdmin(caller);
    switch (jobListings.get(jobId)) {
      case (null) { Runtime.trap("Job listing not found") };
      case (?job) {
        let approvedJob = {
          id = job.id;
          title = job.title;
          company = job.company;
          location = job.location;
          salary = job.salary;
          category = job.category;
          description = job.description;
          employerId = job.employerId;
          approved = true;
        };
        jobListings.add(jobId, approvedJob);
      };
    };
  };

  public shared ({ caller }) func adminDeleteJob(jobId : Nat) : async () {
    assertAdmin(caller);
    jobListings.remove(jobId);
  };

  // Public query for blocked users
  public query ({ caller }) func isUserBlocked(user : Principal) : async Bool {
    blockedUsers.containsKey(user);
  };

  // Plan management
  public shared ({ caller }) func adminSetEmployerPlan(employer : Principal, plan : Text) : async () {
    assertAdmin(caller);
    switch (employerProfiles.get(employer)) {
      case (null) { Runtime.trap("Employer not found") };
      case (_) {
        switch (plan) {
          case ("Basic") {};
          case ("Silver") {};
          case ("Gold") {};
          case (_) { Runtime.trap("Invalid plan") };
        };
        employerPlans.add(employer, plan);
      };
    };
  };

  public query ({ caller }) func adminGetAllEmployerPlans() : async [(Principal, Text)] {
    assertAdmin(caller);
    employerPlans.toArray();
  };

  public query ({ caller }) func adminGetAllEmployerActivity() : async [(Principal, EmployerProfile, Nat, Nat, Text)] {
    assertAdmin(caller);
    let activityList = List.empty<(Principal, EmployerProfile, Nat, Nat, Text)>();
    for ((empId, profile) in employerProfiles.entries()) {
      var jobsPosted = 0;
      var totalApplicants = 0;
      for ((_, job) in jobListings.entries()) {
        if (job.employerId == empId) {
          jobsPosted += 1;
          for ((_, app) in applications.entries()) {
            if (app.job.id == job.id) {
              totalApplicants += 1;
            };
          };
        };
      };
      let plan = switch (employerPlans.get(empId)) {
        case (null) { "Basic" };
        case (?p) { p };
      };
      activityList.add((empId, profile, jobsPosted, totalApplicants, plan));
    };
    activityList.toArray();
  };

  // Recent Activity
  public query ({ caller }) func adminGetRecentActivity() : async RecentActivity {
    assertAdmin(caller);
    let jobsArray = jobListings.toArray().map(func((_, job)) { job });
    let appsArray = applications.toArray().map(func((_, app)) { app });

    // Sort in descending order (most recent first)
    let sortedJobs = jobsArray.sort(func(a : JobListing, b : JobListing) : Order.Order {
      Nat.compare(b.id, a.id);
    });
    let sortedApps = appsArray.sort(func(a : JobApplication, b : JobApplication) : Order.Order {
      Nat.compare(b.id, a.id);
    });

    // Take first 5 (which are now the most recent)
    let recentJobs = if (sortedJobs.size() > 5) {
      Array.tabulate(5, func(i) { sortedJobs[i] });
    } else {
      sortedJobs;
    };

    let recentApps = if (sortedApps.size() > 5) {
      Array.tabulate(5, func(i) { sortedApps[i] });
    } else {
      sortedApps;
    };

    {
      recentJobs;
      recentApplications = recentApps;
    };
  };
};
