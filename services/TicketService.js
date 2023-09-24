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
                return sendTicketsToAPI(tickets);
            case 'Employee':
                const employee = tokenPayload.username;
                tickets = await ticketDAO.retrieveTicketsByEmployee(employee);
                return sendTicketsToAPI(tickets);
            default:
                return {status: 'roleUnauthorized'};
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
                    return sendTicketsToAPI(tickets);
                }
            case 'Employee':
                if(tokenPayload.username === queriedEmployeeUsername) {
                    tickets = await ticketDAO.retrieveTicketsByEmployee(queriedEmployeeUsername);
                    return sendTicketsToAPI(tickets); 
                }
                else
                    return {status: 'empUnauthorized'};
            default:
                return {status: 'roleUnauthorized'};
        }
    }
    else
        return {status: 'userAuthFailed'};
}

async function viewTicketsByStatus(token, status) {
    const tokenPayload = await jwtUtil.verifyTokenAndReturnPayload(token);
    const queriedStatus = status.charAt(0).toUpperCase() + status.slice(1);
    let tickets;

    if(tokenPayload) {
        switch(tokenPayload.role) {
            case 'Manager':
                tickets = await ticketDAO.retrieveTicketsByStatus(queriedStatus);
                return sendTicketsToAPI(tickets);
            case 'Employee':
                tickets = await ticketDAO.retrieveEmployeeTicketsByStatus(tokenPayload.username, queriedStatus);
                return sendTicketsToAPI(tickets);
            default:
                return {status: 'roleUnauthorized'};
        }
    }
    else
        return {status: 'userAuthFailed'};
}

async function viewEmployeeTicket(token, employee, ticket_id) {
    const tokenPayload = await jwtUtil.verifyTokenAndReturnPayload(token);
    const queriedEmployee = await employeeDAO.getEmployee(employee);
    const queriedEmployeeUsername = queriedEmployee.Item.username;
    const queriedEmployeeRole = queriedEmployee.Item.role;
    let ticket;

    if(tokenPayload) {
        switch(tokenPayload.role) {
            case 'Manager':
                if(queriedEmployeeRole === 'Manager')
                    return {status: 'userIsManager'};
                else {
                    ticket = await ticketDAO.retrieveTicket(ticket_id);
                    return sendTicketToAPI(ticket);
                }
            case 'Employee':
                if(tokenPayload.username === queriedEmployeeUsername) {
                    ticket = await ticketDAO.retrieveTicket(ticket_id);
                    return sendTicketToAPI(ticket); 
                }
                else
                    return {status: 'empUnauthorized'};
            default:
                return {status: 'roleUnauthorized'};
        }
    }
    else
        return {status: 'userAuthFailed'};
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

function sendTicketsToAPI(tickets) {
    if(tickets.Items[0]) {
        return {
            status: 'retrievalSuccess',
            data: tickets.Items
        };
    }
    else if(!tickets.Items[0])
        return {status: 'noTicketsFound'};
    else
        return {status: 'retreivalFailure'};
}

function sendTicketToAPI(ticket) {
    if(ticket.Item) {
        return {
            status: 'retrievalSuccess',
            data: ticket.Item
        };
    }
    else if(!ticket.Item)
        return {status: 'noTicketFound'};
    else
        return {status: 'retreivalFailure'};
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