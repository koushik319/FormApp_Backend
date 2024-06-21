const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3200;
const dbPath = 'db.json'; // Path to your JSON database file

app.use(express.json());

// "Ping Endpoint"

app.get('/ping', (req, res) => {
  res.json({ success: true });
});

// "Submit Endpoint"

app.post('/submit', (req, res) => {
  const { name, email, phone, github_link } = req.body;

  // Validate required fields
  if (!name || !email || !phone || !github_link) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  // Construct the submission object
  const submission = { name, email, phone, github_link };

  // Load existing submissions from file (if any)
  let submissions = [];
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    submissions = JSON.parse(data);
  } catch (err) {
    console.error('Error reading file:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }

  // Add the new submission to the array
  submissions.push(submission);

  // Write the updated submissions array back to the file
  try {
    fs.writeFileSync(dbPath, JSON.stringify(submissions, null, 2));
    res.json({ success: true, message: 'Submission saved successfully.' });
  } catch (err) {
    console.error('Error writing file:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// "Read Endpoint"
app.get('/read', (req, res) => {
  const index = parseInt(req.query.index, 10);

  let submissions = [];
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      submissions = JSON.parse(data);
    } else {
      return res.status(404).json({ success: false, message: 'Database file not found' });
    }
  } catch (err) {
    console.error('Error reading file:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }

  if (isNaN(index)) {
    // Return the latest submission if no index is provided
    if (submissions.length === 0) {
      return res.status(404).json({ success: false, message: 'No submissions found' });
    }
    return res.json(submissions[submissions.length - 1]);
  }

  if (index < 0 || index >= submissions.length) {
    return res.status(400).json({ success: false, message: 'Invalid index' });
  }

  // Return the requested submission
  res.json(submissions[index]);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
