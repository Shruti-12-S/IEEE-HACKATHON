import app from "./app.js";
import { connectDB } from "./config/db.js";

const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(port, () => console.log(`API listening on port ${port}`));
  })
  .catch((error) => {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  });
