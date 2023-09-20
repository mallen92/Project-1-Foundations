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

const validateTicketInfo = (req, res, next) => {
    if(!req.body.employee_id || !req.body.description || !req.body.amount){
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
server.post('/register', validateEmployeeCreds, (req, res) => {
    const body = req.body;

    if(body.valid) {
        employeeDAO.retrieveEmployee(body.username, body.password)
            .then((data) => {
                if(data.Items[0]) {
                    res.send('That employee is already registered.');
                    logger.error('Credentials for existing employee provided during employee registration.');
                }
                else {
                    employeeDAO.createEmployee(uuid.v4(), body.username, body.password)
                        .then(() => {
                            res.send('Employee successfully registered!');
                            logger.info('Employee successfully registered!');
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

    if(body.valid) {
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
server.post('/tickets', validateTicketInfo, (req, res) => {
    const body = req.body;

    if(body.valid) {
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

// Retrive pending tickets (anagers)
server.get('/tickets', validateTicketStatus, (req, res) => {
    const body = req.body;

    if(body.role === "Manager") {
        ticketDAO.retrievePendingTickets()
            .then((data) => {
                res.send(data.Items);
                logger.info('Successfully retrieved pending tickets!');
            });
    }
    else {
        res.send('Unable to retrieve tickets');
        logger.error('Unable to retreive tickets for manager.');
    }
})

// Update ticket status (managers)
server.put('/tickets', validateTicketStatus, (req, res) => {
    const body = req.body;

    if (body.valid) {
        if (body.role === "Manager") {
            ticketDAO.updateTicketStatus(body.ticket_id, body.status)
                .then(() => {
                    res.send('Ticket status updated successfully!');
                    logger.info('Ticket status updated successfully!');
                })     
        }
        else {
            res.send('Unauthorized');
            logger.error('Unauthorized attempt to modify ticket status.');
        }
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