const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the root directory
app.use(express.static('.'));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve design.html for the design route
app.get('/design', (req, res) => {
    res.sendFile(path.join(__dirname, 'design', 'design.html'));
});

// Serve checkout.html for the checkout route
app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'checkout.html'));
});

// Serve success.html for the success route
app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'success.html'));
});

// Handle all other routes by serving the requested file
app.get('*', (req, res) => {
    const filePath = path.join(__dirname, req.path);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('File not found');
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app; 