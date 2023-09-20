const express = require('express');
const server = express();
const bodyParser = require('body-parser');
const uuid = require('uuid');
const employeeDAO = require('./repository/EmployeeDAO');
const ticketDAO = require('./repository/TicketDAO');
const logger = require('./log');
const PORT = 8000;

// Third-party middleware
server.use(bodyParser.json());

// Custom middleware
const validateEmployeeCreds = (req, res, next) => {
    if(!req.body.username || !req.body.password){
        req.body.valid = false;
        next();
    }else{
        req.body.valid = true;
        next();
    }
}

const validateTicket = (req, res, next) => {
    if(!req.body.employee_id || !req.body.description || !req.body.amount){
        req.body.valid = false;
        next();
    }else{
        req.body.valid = true;
        next();
    }
}

/* ------------------- HANDLERS ------------------- */

// Employee registration
server.post('/register', validateEmployeeCreds, (req, res) => {
    const body = req.body;

    if(req.body.valid) {
        employeeDAO.retrieveEmployee(body.username, body.password)
            .then((data) => {
                if(data.Items[0]) {
                    res.send('That employee is already registered.');
                    logger.error('Credentials for existing employee provided during employee registration.');
                }
                else {
                    employeeDAO.createEmployee(uuid.v4(), body.username, body.password)
                        .then(() => {
                            res.send('Ticket successfully created!');
                            logger.info('Ticket successfully created!');
                        })
                        .catch((err) => {
                            res.send('Employee registration unsuccessful.');
                            logger.error('Employee registration unsuccessful.');
                        })
                }
            })
    }
    else {
        res.send('Invalid item properties...');
        logger.error('Invalid item properties provided during employee registration.');
    }
});

// Employee login
server.post('/login', validateEmployeeCreds, (req, res) => {
    const body = req.body;

    if(req.body.valid) {
        employeeDAO.retrieveEmployee(body.username, body.password)
            .then((data) => {
                if(data.Items[0]) {
                    res.send('Employee successfully logged in!');
                    logger.info('Employee successfully logged in.');
                }
                else {
                    res.send('Invalid credentials provided.');
                    logger.error('Invalid credentials provided during a login attempt.');
                }
            })
            .catch((err) => {
                res.send('Employee login failed.');
                logger.error('Employee login failed.');
            })
    }
    else {
        res.send('Invalid item properties...');
        logger.error('Invalid item properties provided during employee login.');
    }
});

// Create a ticket
server.post('/tickets', validateTicket, (req, res) => {
    const body = req.body;

    if(req.body.valid) {
        ticketDAO.createTicket(uuid.v4(), body.employee_id, body.description, body.amount)
            .then(() => {
                res.send('Ticket successfully created!');
                logger.info('Ticket successfully created!');
            })
            .catch((err) => {
                res.send('Ticket creation unsuccessful.');
                logger.error('Ticket creation unsuccessful.');
            })
    }
    else {
        res.send('Invalid item properties...');
        logger.error('Invalid item properties provided during ticket creation.');
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    logger.info(`Server is running on port ${PORT}`);
});