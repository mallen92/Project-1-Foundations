const uuid = require('uuid');
const ticketDAO = require('../repository/TicketDAO');
const jwtUtil = require('../utility/jwt_util');
const logger = require('../log');

function createTicket(description, amount, token, res) {
    jwtUtil.verifyTokenAndReturnPayload(token)
        .then((payload) => {
            if(payload.role === 'Employee') {
                ticketDAO.createTicket(uuid.v4(), payload.username, description, amount)
                    .then(() => {
                        res.statusCode = 200;
                        res.send('Ticket successfully created!');
                        logger.info('Ticket successfully created!');
                    })
                    .catch((err) => {
                        res.statusCode = 500;
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

function viewAllTickets(token, res) {
    jwtUtil.verifyTokenAndReturnPayload(token)
        .then((payload) => {
            const role = payload.role;

            if (role === 'Manager') {
                ticketDAO.retrieveAllTickets()
                    .then((data) => {
                        if(data.Items[0]) {
                            res.send(data.Items);
                            logger.info('All tickets were successfully retreived!');
                        }
                        else {
                            res.send('There are no tickets.');
                            logger.info('Manager has no tickets to view.');
                        }
                    })
            }
            else {
                res.statusCode = 401;
                res.send('You are unauthorized to view tickets.');
                logger.info('There was an unauthorized attempt to view all tickets.');
            }
        })
}

function viewTicketsByEmployee(token, res, employee = null) {
    jwtUtil.verifyTokenAndReturnPayload(token)
        .then((payload) => {
            const role = payload.role;

            if(role === 'Employee') {
                employee = payload.username;
                retrieveTicketsByEmployee(employee, res);
            }
            else if(role === 'Manager')
                retrieveTicketsByEmployee(employee, res);
            else {
                res.statusCode = 401;
                res.send('You are unauthorized to view tickets');
                logger.info('Unauthorized attempt to view tickets.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.statusCode = 401;
            res.send('Failed to authenticate token.')
        })
}

function viewTicketsByStatus(status, token, res) {
    jwtUtil.verifyTokenAndReturnPayload(token)
        .then((payload) => {
            const role = payload.role;
            const employee = payload.username;
            const capitalStatus = status.charAt(0).toUpperCase() + status.slice(1);

            if(role === 'Employee') {
                ticketDAO.retrieveEmployeeTicketsByStatus(employee, capitalStatus)
                    .then((data) => {
                        if(data.Items[0]) {
                            res.send(data.Items);
                            logger.info(`Employee ${employee}'s ${status} tickets were successfully retreived!`);
                        }
                        else {
                            res.statusCode = 400;
                            res.send('You have no tickets.');
                            logger.info(`Employee ${employee} has no ${status} tickets to view.`);
                        }
                    })
            }
            else if(role === "Manager") {
                ticketDAO.retrieveTicketsByStatus(capitalStatus)
                    .then((data) => {
                        if(data.Items[0]) {
                            res.send(data.Items);
                            logger.info(`All of the ${status} tickets were successfully retreived!`);
                        }
                        else {
                            res.statusCode = 400;
                            if(status === "Pending") {
                                res.send(`There are no ${status} tickets to process`);
                                logger.info(`There are no ${status} tickets to process.`);
                            }
                            else {
                                res.send(`There are no ${status} tickets to view.`);
                                logger.info(`There are no ${status} tickets to view.`);
                            }

                        }
                    })
            }
            else {
                res.statusCode = 401;
                res.send('You are unauthorized to view tickets');
                logger.info('Unauthorized attempt to view tickets.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.statusCode = 401;
            res.send('Failed to authenticate token.')
        })
}

function viewEmployeeTicket(ticket_id, token, res) {
    jwtUtil.verifyTokenAndReturnPayload(token)
        .then((payload) => {
            const role = payload.role;

            if(role === 'Employee' || role === 'Manager') {
                ticketDAO.retrieveEmployeeTicket(ticket_id)
                    .then((data) => {
                        if(data.Item) {
                            res.send(data.Item);
                            logger.info('Ticket was successfully retreived!');
                        }
                        else {
                            res.statusCode = 400;
                            res.send('Ticket not found.');
                            logger.info('Ticket not found.');
                        }
                    })
            }
            else {
                res.statusCode = 401;
                res.send('You are unauthorized to view tickets');
                logger.info('Unauthorized attempt to view tickets.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.statusCode = 401;
            res.send('Failed to authenticate token.')
        })
}

function displayErrorMissingReimbItems(item, res) {
    res.statusCode = 400;
    res.send(`Please provide a reimbursement ${item}.`);
    logger.error(`No reimbursment ${item} was provided during ticket creation.`);
}

/*-------------------- HELPER FUNCTIONS --------------------*/

function retrieveTicketsByEmployee(employee, res) {
    ticketDAO.retrieveTicketsByEmployee(employee)
        .then((data) => {
            if(data.Items[0]) {
                res.send(data.Items);
                logger.info(`Employee ${employee}'s tickets were successfully retreived!`);
            }
            else {
                res.statusCode = 400;

                if(role === 'Employee')
                    res.send('You have no tickets.');
                else
                    res.send(`Employee ${employee} has no tickets.`);

                logger.info(`Employee ${employee} has no tickets.`);
            }
        })
}

/*-------------------- END HELPER FUNCTIONS --------------------*/

module.exports = {
    createTicket,
    viewAllTickets,
    viewTicketsByEmployee,
    viewTicketsByStatus,
    viewEmployeeTicket,
    displayErrorMissingReimbItems
}