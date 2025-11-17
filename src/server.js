import './config/env.js';
import app from './app.js';
import connectDB from './config/db.js';

const port = process.env.PORT || 4000;

(async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
  });
})();    
   