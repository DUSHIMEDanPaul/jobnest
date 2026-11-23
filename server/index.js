// JobNest API — Express + MongoDB.
// Response shapes follow the MongoDB driver (insertedId, modifiedCount, deletedCount)
// because the React frontend checks for them.
const express = require("express");
const cors = require("cors");
const { ObjectId } = require("mongodb");
const { connect } = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

// CLIENT_ORIGINS: comma-separated list; unset = allow all origins.
const origins = (process.env.CLIENT_ORIGINS || "")
  .split(",")
  .map((s) => s.trim().replace(/\/+$/, ""))
  .filter(Boolean);
app.use(cors(origins.length ? { origin: origins } : {}));
app.use(express.json({ limit: "1mb" }));

const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Parse an id from the URL; answers 400 itself and returns null when invalid.
const toId = (id, res) => {
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: "Invalid id" });
    return null;
  }
  return new ObjectId(id);
};

// Only accept the job fields the frontend sends.
const JOB_FIELDS = [
  "bannerUrl", "category", "deadline", "description", "postingDate",
  "salary_range", "salaryRange", "title", "applicantsNumber",
];
const pickJob = (body) => {
  const job = {};
  for (const k of JOB_FIELDS) if (body[k] !== undefined) job[k] = body[k];
  if (body.loggedInUserInfo) {
    job.loggedInUserInfo = {
      email: String(body.loggedInUserInfo.email || "").toLowerCase(),
      name: String(body.loggedInUserInfo.name || ""),
    };
  }
  if (job.salary_range && !job.salaryRange) job.salaryRange = job.salary_range;
  if (job.applicantsNumber !== undefined) job.applicantsNumber = Number(job.applicantsNumber) || 0;
  return job;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function main() {
  const db = await connect();
  const jobs = db.collection("jobs");
  const applications = db.collection("applications");
  const blogs = db.collection("blogs");
  const users = db.collection("users");
  const subscribers = db.collection("subscribers");

  await Promise.all([
    jobs.createIndex({ "loggedInUserInfo.email": 1 }),
    applications.createIndex({ email: 1 }),
    applications.createIndex({ email: 1, jobId: 1 }, { unique: true }),
    users.createIndex({ email: 1 }, { unique: true }),
    subscribers.createIndex({ email: 1 }, { unique: true }),
  ]);

  // ---- Health -------------------------------------------------------------
  app.get("/", (req, res) => res.send("JobNest server is running"));
  app.get("/health", asyncRoute(async (req, res) => {
    await db.command({ ping: 1 });
    res.json({ status: "ok", database: "connected" });
  }));

  // ---- Users (frontend POSTs to the API root after sign-up / social login) -
  app.post("/", asyncRoute(async (req, res) => {
    const email = String(req.body.email || "").toLowerCase().trim();
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "Valid email required" });
    const result = await users.updateOne(
      { email },
      { $setOnInsert: { email, createdAt: req.body.createdAt || new Date().toISOString() } },
      { upsert: true }
    );
    // insertedId only for a new user, so the "Account Created" popup shows once.
    res.json(result.upsertedId ? { acknowledged: true, insertedId: result.upsertedId } : { acknowledged: true });
  }));

  // ---- Jobs ---------------------------------------------------------------
  app.get("/alljob", asyncRoute(async (req, res) => {
    res.json(await jobs.find().sort({ _id: -1 }).toArray());
  }));

  app.post("/alljob", asyncRoute(async (req, res) => {
    const job = pickJob(req.body);
    if (!job.title || !job.category) return res.status(400).json({ error: "title and category are required" });
    job.applicantsNumber = job.applicantsNumber || 0;
    res.status(201).json(await jobs.insertOne(job));
  }));

  app.get("/job/:id", asyncRoute(async (req, res) => {
    const _id = toId(req.params.id, res);
    if (!_id) return;
    const job = await jobs.findOne({ _id });
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  }));

  app.put("/job/:id", asyncRoute(async (req, res) => {
    const _id = toId(req.params.id, res);
    if (!_id) return;
    const result = await jobs.updateOne({ _id }, { $set: pickJob(req.body) });
    if (!result.matchedCount) return res.status(404).json({ error: "Job not found" });
    res.json(result);
  }));

  app.delete("/job/:id", asyncRoute(async (req, res) => {
    const _id = toId(req.params.id, res);
    if (!_id) return;
    const result = await jobs.deleteOne({ _id });
    if (!result.deletedCount) return res.status(404).json({ error: "Job not found" });
    await applications.deleteMany({ jobId: req.params.id });
    res.json(result);
  }));

  // Jobs posted by one user (My Jobs page).
  app.get("/jobs/:email", asyncRoute(async (req, res) => {
    const email = req.params.email.toLowerCase();
    res.json(await jobs.find({ "loggedInUserInfo.email": email }).sort({ _id: -1 }).toArray());
  }));

  // ---- Applications -------------------------------------------------------
  app.post("/apply", asyncRoute(async (req, res) => {
    const { name, resumeLink, jobId, jobTitle } = req.body;
    const email = String(req.body.email || "").toLowerCase().trim();
    if (!EMAIL_RE.test(email) || !jobId) return res.status(400).json({ error: "email and jobId are required" });
    if (!ObjectId.isValid(jobId)) return res.status(400).json({ error: "Invalid jobId" });

    const job = await jobs.findOne({ _id: new ObjectId(jobId) });
    if (!job) return res.status(404).json({ error: "Job not found" });
    if (job.loggedInUserInfo?.email === email) return res.status(400).json({ error: "You cannot apply to your own job" });
    if (job.deadline && new Date(job.deadline) < new Date()) return res.status(400).json({ error: "The deadline has passed" });

    try {
      const result = await applications.insertOne({
        name: String(name || ""),
        email,
        resumeLink: String(resumeLink || ""),
        jobId: String(jobId),
        jobTitle: String(jobTitle || job.title || ""),
        category: job.category,
        appliedAt: req.body.appliedAt || new Date().toISOString(),
      });
      await jobs.updateOne({ _id: job._id }, { $inc: { applicantsNumber: 1 } });
      res.status(201).json(result);
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ error: "You already applied to this job" });
      throw err;
    }
  }));

  // Applications made by one user (Applied Jobs page).
  app.get("/apply/:email", asyncRoute(async (req, res) => {
    const email = req.params.email.toLowerCase();
    res.json(await applications.find({ email }).sort({ _id: -1 }).toArray());
  }));

  // ---- Career blog --------------------------------------------------------
  app.get("/career-blog", asyncRoute(async (req, res) => {
    res.json(await blogs.find().sort({ date: -1 }).toArray());
  }));

  app.get("/career-blog/:id", asyncRoute(async (req, res) => {
    const _id = toId(req.params.id, res);
    if (!_id) return;
    const blog = await blogs.findOne({ _id });
    if (!blog) return res.status(404).json({ error: "Blog post not found" });
    res.json(blog);
  }));

  // ---- Newsletter (frontend shows `message` on success, `error` otherwise) -
  app.post("/subscribe", asyncRoute(async (req, res) => {
    const email = String(req.body.email || "").toLowerCase().trim();
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "Please enter a valid email address." });
    try {
      await subscribers.insertOne({ email, subscribedAt: new Date().toISOString() });
      res.json({ message: "Thanks for subscribing!" });
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ error: "You are already subscribed." });
      throw err;
    }
  }));

  // ---- Errors -------------------------------------------------------------
  app.use((req, res) => res.status(404).json({ error: "Not found" }));
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Something went wrong on the server." });
  });

  app.listen(PORT, () => console.log(`JobNest server listening on port ${PORT}`));
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
