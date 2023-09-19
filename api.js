const express = require('express');
const server = express();
const bodyParser = require('body-parser');
const uuid = require('uuid');
const employeeDAO = require('./repository/EmployeeDAO');
const logger = require('./log');
const PORT = 8000;

// Third-party middleware
server.use(bodyParser.json());

// Custom middleware
const validateNewEmployee = (req, res, next) => {
    if(!req.body.username || !req.body.password){
        req.body.valid = false;
        next();
    }else{
        req.body.valid = true;
        next();
    }
}

/* ------------------- HANDLERS ------------------- */

// Employee registration
server.post('/employees', validateNewEmployee, (req, res) => {
    const body = req.body;

    if(req.body.valid) {
        employeeDAO.addEmployee(uuid.v4(), body.username, body.password)
            .then(() => {
                res.send('Employee successfully registered!');
                logger.info('Employee successfully registered!');
            })
            .catch((err) => {
                res.send('Employee registration unsuccessful.');
                logger.error('Employee registration unsuccessful.');
            })
    }
    else {
        res.send('Invalid item properties...');
        logger.error('Invalid item properties provided for employee registration.');
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    logger.info(`Server is running on port ${PORT}`);
});