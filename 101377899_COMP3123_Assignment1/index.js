const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const app = express();
const port = 8080;

app.use(express.json());

// MongoDB connection setup
mongoose.connect('mongodb://localhost/comp3123_assignment1', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');

        // Define the User schema and model here
        const userSchema = new mongoose.Schema({
            //_id: mongoose.Schema.Types.ObjectId,
            username: {
                type: String,
                maxLength: 100,
                required: true,
                unique: true,
            },
            email: {
                type: String,
                maxLength: 50,
                unique: true,
            },
            password: {
                type: String,
                maxLength: 50,
            }
        });

        // Create the User model
        const User = mongoose.model('User', userSchema);

        const employeeSchema = new mongoose.Schema({
            //_id: mongoose.Schema.Types.ObjectId,
            first_name: {
                type: String,
                maxLength: 100,
                required: true,
            },
            last_name: {
                type: String,
                maxLength: 50,
                required: true,
            },
            email: {
                type: String,
                maxLength: 50,
                unique: true,
            },
            gender: {
                type: String,
                enum: ['male', 'female', 'other'],
                required: true,
            },
            salary: {
                type: String,
                required: true,
            },
        });

        // Create the Employee model
        const Employee = mongoose.model('Employee', employeeSchema);

        //signup endpoint
        app.post('/api/v1/user/signup', async (req, res) => {
            try {
                // Create a new user instance with the provided data
                const newUser = new User({
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password,
                });

                // Save the user to the database
                const savedUser = await newUser.save();
                res.status(201).json(savedUser);
            } catch (error) {
                console.error(error);
                res.status(500).send('Error creating user');
            }
        });

        // login endpoint
        app.post('/api/v1/user/login', async (req, res) => {
            const { username, password } = req.body;

            try {
                // Find the user by their username
                const user = await User.findOne({ username });

                if (!user) {
                    return res.status(401).json({ message: 'Authentication failed. User not found.' });
                }

                // Compare the provided password with the stored password (no hashing)
                if (password === user.password) {
                    // If the password matches, generate a JWT token
                    const token = jwt.sign({ username: user.username, email: user.email }, 'yourSecretKey', {
                        expiresIn: '1h', // Token expiration time
                    });

                    res.status(200).json({ message: 'Authentication successful', token });
                } else {
                    res.status(401).json({ message: 'Authentication failed. Incorrect password.' });
                }
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Authentication failed. Server error.' });
            }
        });

        //get list of employees endpoint
        app.get('/api/v1/emp/employees', async (req, res) => {
            try {
                const employees = await Employee.find();
                res.status(200).json(employees);
            } catch (error) {
                console.error(error);
                res.status(500).send('Error retrieving employees');
            }
        });

        //create new employee endpoint
        app.post('/api/v1/emp/employees', async (req, res) => {
            try {
                const newEmployee = new Employee({
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    email: req.body.email,
                    gender: req.body.gender,
                    salary: req.body.salary,
                });

                const savedEmployee = await newEmployee.save();
                res.status(201).json(savedEmployee);
            } catch (error) {
                console.error(error);
                res.status(500).send('Error creating employee');
            }
        });

        //view employee by ID
        app.get('/api/v1/emp/employees/:employeeID', async (req, res) => {
            try {
                const employee = await Employee.findById(req.params.employeeID);

                if (!employee) {
                    return res.status(404).json({ message: 'Employee not found' });
                }

                res.status(200).json(employee);
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Error retrieving employee' });
            }
        });

        // Update Employee by ID
        app.put('/api/v1/emp/employees/:employeeID', async (req, res) => {
            try {
                const employeeID = req.params.employeeID;
                const updatedData = req.body;

                // Find the employee by ID and update their details
                const updatedEmployee = await Employee.findByIdAndUpdate(employeeID, updatedData, { new: true });

                if (!updatedEmployee) {
                    return res.status(404).json({ message: 'Employee not found' });
                }

                res.status(200).json(updatedEmployee);
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Error updating employee' });
            }
        });

        // Delete Employee by ID
        app.delete('/api/v1/emp/employees', async (req, res) => {
            try {
                const employeeID = req.query.eid;

                // Find the employee by ID and delete them
                const deletedEmployee = await Employee.findByIdAndDelete(employeeID);

                if (!deletedEmployee) {
                    return res.status(404).json({ message: 'Employee not found' });
                }

                res.status(204).end();
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Error deleting employee' });
            }
        });



    })
    .catch(err => console.error('Could not connect to MongoDB', err));

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
