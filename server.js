import express from 'express';
import cors from 'cors';
import morgan from "morgan"
import authRoute from "./routes/auth.routes.js"
import projectRoute from "./routes/project.routes.js"
import journalRoute from "./routes/journal.routes.js"

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: ['http://localhost:5173'],
  }),
);

app.use(express.json());
app.use(morgan("combined"));

// ROUTES ICI
app.use("/api/auth", authRoute )
app.use("/api/project" , projectRoute)
app.use("/api/project/:id_project/journal", journalRoute)
// app.use("/api/project/:id_project/task", taskRoute)
// app.use("/api/project/:id_project/bug", bugRoute)
// app.use("/api/project/:id_project/sprint", sprintRoute)
// app.use("/api/project/:id_project/schema", schemaRoute)
// app.use("/api/project/:id_project/github", githubRoute)
// app.use("/api/project/:id_project/team", teamRoute)

app.listen(PORT, () => {
  console.log(`🔥 Backend running on http://localhost:${PORT}`);
});
