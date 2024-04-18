const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');

const app = express();
const upload = multer({ dest: 'uploads/' });

 
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'mydb'
});


connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

 
connection.query( `
    CREATE TABLE IF NOT EXISTS formDetails (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        profilePicture VARCHAR(255)
    );
`, (err) => {
    if (err) {
        console.error('Error creating table:', err);
    } else {
        console.log('Table "formDetails" created successfully');
    }
});

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/', upload.single('profile-picture'), (req, res) => {
    const { name, email, mobile } = req.body;
    const profilePicture = req.file;
    const formData = { name, email, mobile, profilePicture: profilePicture ? profilePicture.originalname : null };
    connection.query('INSERT INTO formDetails SET ?', formData, (err, result) => {
        if (err) {
            console.error('Error inserting form data into database:', err);
            return res.status(500).send('Error saving form data');
        }
        console.log('Form data saved to database');
    });

     if (profilePicture) {
        const targetPath = path.join(__dirname, 'uploads', profilePicture.originalname);
        fs.rename(profilePicture.path, targetPath, (err) => {
            if (err) {
                console.error('Error moving profile picture:', err);
                return res.status(500).send('Error moving profile picture');
            }
            console.log('Profile picture uploaded successfully');
        });
    }

    res.send("Form submitted successfully!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
