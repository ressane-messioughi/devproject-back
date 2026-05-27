import express from 'express';
import cors from 'cors';
import morgan from "morgan"

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

app.listen(PORT, () => {
  console.log(`🔥 Backend running on http://localhost:${PORT}`);
});
