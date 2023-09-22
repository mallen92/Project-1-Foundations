const express = require('express');
const server = express();
const bodyParser = require('body-parser');
const uuid = require('uuid');
const employeeService = require('./services/EmployeeService');
const ticketDAO = require('./repository/TicketDAO');
const logger = require('./log');
const PORT = 8000;

/* ------------------- MIDDLEWARE FUNCTIONS ------------------- */

server.use(bodyParser.json());

const validateTicketInfo = (req, res, next) => {
    if(!req.body.description || !req.body.amount){
        req.body.valid = false;
        next();
    }else{
        req.body.valid = true;
        next();
    }
}

const validateTicketStatus = (req, res, next) => {
    if(req.body.status !== "Approved" && req.body.status !== "Denied") {
        req.body.valid = false;
        next();
    }
    else {
        req.body.valid = true;
        next();
    }
}

/* ------------------- HANDLERS ------------------- */

// Employee registration
server.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if(username && password) { employeeService.registerEmployee(username, password, res); }
    else if(!username) {
        res.statusCode = 400;
        res.send('Please provide a username.');
        logger.error('No username was provided during employee registration.');
    }
    else if(!password) {
        res.statusCode = 400;
        res.send('Please provide a password.');
        logger.error('No password was provided during employee registration.');
    }
});

// Employee login
server.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if(username && password) { employeeService.loginEmployee(username, password, res); }
    else if(!username) {
        res.statusCode = 400;
        res.send('Please provide a username.');
        logger.error('No username was provided during employee login.');
    }
    else if(!password) {
        res.statusCode = 400;
        res.send('Please provide a password.');
        logger.error('No password was provided during employee login');
    }
});

// Create a ticket
server.post('/tickets', validateTicketInfo, (req, res) => {
    const description = req.body.description;
    const amount = req.body.amount;
    const token = req.headers.authorization.split(' ')[1]; // ['Bearer', '<token>']

    if(req.body.valid) {
        jwtUtil.verifyTokenAndReturnPayload(token)
            .then((payload) => {
                if(payload.role === 'Employee') {
                    ticketDAO.createTicket(uuid.v4(), payload.username, description, amount)
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
                    res.statusCode = 401;
                    res.send(`Unauthorized: ${payload.role}s cannot submit tickets.`);
                    logger.error('There was an unauthorized attempt to submit a ticket.');
                }
            })
            .catch((err) => {
                console.error(err);
                res.statusCode = 401;
                res.send('Failed to authenticate token.')
            })
    }
    else {
        res.send('Ticket is missing information.');
        logger.error('Submission attempt of ticket with missing information');
    }
});

// Retrieve tickets
server.get('/tickets', (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // ['Bearer', '<token>']

    jwtUtil.verifyTokenAndReturnPayload(token)
        .then((payload) => {
            const username = payload.username;

            if(payload.role === 'Employee') {
                ticketDAO.employeeRetrieveTickets(username)
                    .then((data) => {
                        if(data.Items[0]) {
                            res.send(data.Items);
                            logger.info(`Employee ${username}'s tickets were successfully retreived!`);
                        }
                        else {
                            res.send('No submitted tickets found.');
                            logger.info(`Employee ${username}'s tickets has no submitted tickets.`);
                        }
                    })
            }
            else if (payload.role === 'Manager') {
                ticketDAO.managerRetrieveTickets()
                    .then((data) => {
                        if(data.Items[0]) {
                            res.send(data.Items);
                            logger.info(`Pending tickets successfully retreived!`);
                        }
                        else {
                            res.send('There are no pending tickets to process.');
                            logger.info(`Manager ${username}'s ticket queue is empty.`);
                        }
                    })
            }
            else {
                res.statusCode = 401;
                res.send('You are unauthorized to view tickets.');
                logger.info('There was an unauthorized attempt to view tickets.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.statusCode = 401;
            res.send('Failed to authenticate token.');
        })
});

// Update ticket status
server.put('/tickets', validateTicketStatus, (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // ['Bearer', '<token>']
    const ticket_id = req.body.ticket_id;
    const status = req.body.status;

    if(req.body.valid) {
        jwtUtil.verifyTokenAndReturnPayload(token)
        .then((payload) => {
            if(payload.role === 'Manager') {
                ticketDAO.updateTicketStatus(ticket_id, status)
                    .then(() => {
                        res.send('Ticket status updated successfully!');
                        logger.info('Ticket status updated successfully!');
                    })   
            }
            else {
                res.statusCode = 401;
                res.send('You are unauthorized to modify the status of tickets.');
                logger.info('There was an unauthorized attempt to modify ticket status.');
            }
        })
    }
    else {
        res.send('Unable to update ticket status');
        logger.error('Unable to update ticket status.');
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    logger.info(`Server is running on port ${PORT}.`);
});