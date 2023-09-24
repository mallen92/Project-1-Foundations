const { Router } = require('express');
const employeeService = require('../services/EmployeeService');
const router = Router();
module.exports = router;

// Employee registration
router.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    employeeService.registerEmployee(username, password, res);
});

// Employee login
router.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    employeeService.loginEmployee(username, password, res);
});
