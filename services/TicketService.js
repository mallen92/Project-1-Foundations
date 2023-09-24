const uuid = require('uuid');
const ticketDAO = require('../repository/TicketDAO');
const employeeDAO = require('../repository/EmployeeDAO');
const jwtUtil = require('../utility/jwt_util');
const logger = require('../log');

async function createTicket(description, amount, token) {
    const tokenPayload = await jwtUtil.verifyTokenAndReturnPayload(token);

    if(tokenPayload) {
        if(tokenPayload.role === 'Employee') {
            const ticketCreated = await ticketDAO.createTicket(uuid.v4(), tokenPayload.username, description, amount);

            if(ticketCreated)
                return 'ticketCreationSuccess';
            else
                return 'ticketCreationFailed';
        }
        else
            return 'userIsManager';
    }
    else
        return 'userAuthFailed';
}

async function viewAllTickets(token) {
    const tokenPayload = await jwtUtil.verifyTokenAndReturnPayload(token)
    let tickets;

    if(tokenPayload) {
        switch(tokenPayload.role) {
            case 'Manager':
                tickets = await ticketDAO.retrieveAllTickets();
                return respondToAPI(tickets);
            case 'Employee':
                const employee = tokenPayload.username;
                tickets = await ticketDAO.retrieveTicketsByEmployee(employee);
                return respondToAPI(tickets);
            default:
                return {status: 'userUnauthorized'};
        }
    }
    else
        return {status: 'userAuthFailed'};
}

async function viewTicketsByEmployee(token, employee) {
    const tokenPayload = await jwtUtil.verifyTokenAndReturnPayload(token);
    const queriedEmployee = await employeeDAO.getEmployee(employee);
    const queriedEmployeeUsername = queriedEmployee.Item.username;
    const queriedEmployeeRole = queriedEmployee.Item.role;
    let tickets;

    if(tokenPayload) {
        switch(tokenPayload.role) {
            case 'Manager':
                if(queriedEmployeeRole === 'Manager')
                    return {status: 'userIsManager'};
                else {
                    tickets = await ticketDAO.retrieveTicketsByEmployee(queriedEmployeeUsername);
                    return respondToAPI(tickets);
                }
            case 'Employee':
                if(tokenPayload.username === queriedEmployeeUsername) {
                    tickets = await ticketDAO.retrieveTicketsByEmployee(queriedEmployeeUsername);
                    return respondToAPI(tickets); 
                }
                else
                    return {status: 'empUnauthorized'};
            default:
                return {status: 'generalUnauthorized'};
        }
    }
    else
        return {status: 'userAuthFailed'};
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

function viewEmployeeTicket(ticket_id, token) {
    jwtUtil.verifyTokenAndReturnPayload(token)
        .then((payload) => {
            const role = payload.role;
            const emp = payload.username;

            if(role === 'Employee') {
                ticketDAO.retrieveTicket(ticket_id)
                    .then((data) => {
                        const checkedEmp = data.Item.creator_username;

                        if(emp === checkedEmp) {
                            res.send(data.Item);
                            logger.info('Ticket was successfully retreived!');
                        }
                        else {
                            res.statusCode = 401;
                            res.send('You are unauthorized to view this ticket.');
                            logger.info('Unauthorized attempt to a view ticket.');
                        }
                    })
            }
            else if(role === 'Manager') {
                ticketDAO.retrieveTicket(ticket_id)
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

function updateTicketStatus(token, newStatus, ticket_id, res) {
    jwtUtil.verifyTokenAndReturnPayload(token)
        .then((payload) => {
            if(payload.role === 'Manager') {
                ticketDAO.retrieveEmployeeTicket(ticket_id)
                    .then((data) => {
                        const checkedStatus = data.Item.ticket_status;

                        if(checkedStatus === 'Approved' || checkedStatus === 'Denied') {
                            res.statusCode = 401;
                            res.send('This ticket cannot be modified because it has already been processed.');
                            logger.info('There was an attempt to modify the status of a processed ticket.');
                        }
                        else {
                            ticketDAO.updateTicketStatus(ticket_id, newStatus)
                                .then(() => {
                                    res.statusCode = 200;
                                    res.send('Ticket status updated successfully!');
                                    logger.info('Ticket status updated successfully!');
                                })   
                        }
                    })
                    .catch((err) => {
                        res.statusCode = 404;
                        res.send('The status of this ticket could not be retrieved.')
                    });
            }
            else {
                res.statusCode = 401;
                res.send('You are unauthorized to modify the status of tickets.');
                logger.info('There was an unauthorized attempt to modify ticket status.');
            }
        })
        .catch((err) => {
            res.statusCode = 401;
            res.send('Failed to authenticate token.')
        })
}

/*-------------------- HELPER FUNCTIONS --------------------*/

function respondToAPI(tickets) {
    if(tickets) {
        return {
            status: 'retrievalSuccess',
            data: tickets.Items
        };
    }
    else
        return 'retreivalFailure';
}

/*-------------------- END HELPER FUNCTIONS --------------------*/

module.exports = {
    createTicket,
    viewAllTickets,
    viewTicketsByEmployee,
    viewTicketsByStatus,
    viewEmployeeTicket,
    updateTicketStatus
}