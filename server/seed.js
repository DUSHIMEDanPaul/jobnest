// Seeds sample jobs and career-blog posts.
// Usage: npm run seed            (only adds data when the collections are empty)
//        npm run seed -- --reset (wipes jobs, blogs and applications first)
const { connect, client } = require("./db");

const img = (id) => `https://images.unsplash.com/photo-${id}?w=800`;
const POSTER = { email: "careers@jobnest.example", name: "JobNest Hiring Team" };

// Categories must match the Add/Update Job form options and the homepage tabs.
const JOBS = [
  ["Frontend Developer (React)", "On-Site Job", "$2,500 - $3,500", "1497366216548-37526070297c",
    "Build responsive interfaces in React and Tailwind CSS with our product team in Kigali. You will turn Figma designs into accessible, tested components."],
  ["IT Support Specialist", "On-Site Job", "$1,200 - $1,800", "1519389950473-47ba0277781c",
    "Keep our office running: set up laptops, manage accounts, and solve hardware and network issues for a team of 80."],
  ["Data Analyst", "On-Site Job", "$2,000 - $2,800", "1460925895917-afdab827c52f",
    "Turn raw sales and operations data into dashboards and weekly reports using SQL, Python, and Power BI."],
  ["Backend Engineer (Node.js)", "Remote Job", "$3,500 - $5,000", "1486312338219-ce68d2c6f44d",
    "Design REST APIs in Node.js and Express, model data in MongoDB, and own services from code review to production."],
  ["Technical Writer", "Remote Job", "$1,800 - $2,600", "1455390582262-044cdead277a",
    "Write clear API guides, tutorials, and release notes for a developer platform used in 30 countries."],
  ["Customer Success Associate", "Remote Job", "$1,400 - $2,000", "1521737604893-d14cc237f11d",
    "Help new customers get started, answer questions by chat and email, and feed product insights back to the team."],
  ["Full-Stack Developer (MERN)", "Hybrid Job", "$3,000 - $4,200", "1522071820081-009f0129c71c",
    "Ship features end to end across React, Express, and MongoDB. Three days in the office, two from home."],
  ["UI/UX Designer", "Hybrid Job", "$2,200 - $3,200", "1561070791-2526d30994b5",
    "Run user research, build wireframes and prototypes in Figma, and work closely with developers on the final build."],
  ["DevOps Engineer", "Hybrid Job", "$3,800 - $5,200", "1504384308090-c894fdcc538d",
    "Automate CI/CD pipelines, manage Docker and cloud infrastructure, and keep our services fast and reliable."],
  ["Junior Web Developer", "Part-Time Job", "$15 - $22 / hour", "1498050108023-c5249f4df085",
    "20 hours a week building and maintaining client websites with HTML, CSS, and JavaScript. Great for students."],
  ["Social Media Coordinator", "Part-Time Job", "$12 - $18 / hour", "1552664730-d307ca884978",
    "Plan and schedule posts, track engagement, and grow our community across Instagram, LinkedIn, and X."],
  ["Coding Tutor (Python)", "Part-Time Job", "$18 - $25 / hour", "1531482615713-2afd69097998",
    "Teach Python basics to beginners in small evening classes, and review their weekly coding exercises."],
];

const BLOGS = [
  ["How to Write a CV That Gets Past Applicant Tracking Systems", "Amina Uwase", "2026-11-18", "1454165804606-c3d57bc86b40",
    "Most companies filter CVs with software before a person reads them. Use a simple one-column layout, standard section headings, and the exact skills named in the job post. Put numbers on your achievements: 'cut load time by 40%' says more than 'improved performance'. Save as PDF unless the posting asks for Word, and keep it to one page if you have under five years of experience."],
  ["7 Questions to Ask at the End of Every Interview", "Jean Bosco Habimana", "2026-11-10", "1573497019940-1c28c88b4f3e",
    "When the interviewer asks if you have questions, always say yes. Ask what success looks like in the first 90 days, what the team is working on right now, and what the biggest challenge in the role is. Ask how feedback is given and how people grow on the team. Good questions show you are thinking about the job, not just the offer."],
  ["Remote Work: Building Habits That Keep You Productive", "Grace Mukamana", "2026-10-29", "1600880292203-757bb62b4baf",
    "Working from home gives you freedom, but it needs structure. Keep fixed start and end times, set up a separate work space, and plan your three most important tasks each morning. Over-communicate with your team: share progress in writing and turn your camera on for key meetings. Take real breaks away from the screen."],
  ["From Student to First Developer Job: A Practical Roadmap", "Eric Niyonzima", "2026-10-15", "1517245386807-bb43f82c33c4",
    "Employers hire juniors for what they can show. Build two or three projects that solve real problems, deploy them, and link them on your CV. Contribute to open source, even small fixes. Practise explaining your code out loud, and apply widely: a 5% response rate is normal at the start."],
  ["Negotiating Your First Salary Offer", "Diane Ingabire", "2026-09-30", "1556761175-b413da4baf72",
    "Research the market range for the role and city before the conversation. When the offer arrives, thank them, then ask for time to review it. Counter with a specific number backed by your skills and the market data. Remember that start date, remote days, training budget, and equipment are negotiable too."],
  ["Why Soft Skills Matter as Much as Technical Ones", "Patrick Mugisha", "2026-09-12", "1542744173-8e7e53415bb0",
    "Code is written by teams. Clear writing, listening, and giving and receiving feedback decide how fast a team moves. In interviews, prepare short stories that show how you handled a disagreement, a deadline, or a mistake. Those stories are often what gets you hired."],
];

async function main() {
  const reset = process.argv.includes("--reset");
  const db = await connect();
  const jobs = db.collection("jobs");
  const blogs = db.collection("blogs");

  if (reset) {
    await Promise.all([jobs.deleteMany({}), blogs.deleteMany({}), db.collection("applications").deleteMany({})]);
    console.log("Reset: cleared jobs, blogs and applications.");
  }

  if (await jobs.countDocuments()) {
    console.log("Jobs already present — skipping (use --reset to replace).");
  } else {
    const today = new Date();
    const docs = JOBS.map(([title, category, salary, photo, description], i) => {
      const posted = new Date(today); posted.setDate(today.getDate() - (i % 6) - 1);
      const deadline = new Date(today); deadline.setDate(today.getDate() + 30 + i * 5);
      return {
        bannerUrl: img(photo),
        category,
        deadline: deadline.toISOString().slice(0, 10),
        description,
        loggedInUserInfo: POSTER,
        postingDate: posted.toISOString().slice(0, 10),
        salary_range: salary,
        salaryRange: salary,
        title,
        applicantsNumber: (i * 7) % 23,
      };
    });
    await jobs.insertMany(docs);
    console.log(`Inserted ${docs.length} jobs.`);
  }

  if (await blogs.countDocuments()) {
    console.log("Blog posts already present — skipping (use --reset to replace).");
  } else {
    const docs = BLOGS.map(([title, author, date, photo, content]) => ({ title, author, date, bannerUrl: img(photo), content }));
    await blogs.insertMany(docs);
    console.log(`Inserted ${docs.length} blog posts.`);
  }

  await client.close();
}

main().catch(async (err) => {
  console.error("Seed failed:", err);
  await client.close().catch(() => {});
  process.exit(1);
});
