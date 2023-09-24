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

async function updateTicketStatus(token, updatedStatus, ticket_id) {
    const tokenPayload = await jwtUtil.verifyTokenAndReturnPayload(token);
    const ticketInDB = await ticketDAO.retrieveTicket(ticket_id);
    const ticketInDBStatus = ticketInDB.Item.ticket_status;
    let statusUpdateResult;

    if(tokenPayload) {
        if(tokenPayload.role === 'Manager') {
            if(ticketInDBStatus === 'Pending') {
                statusUpdateResult = await ticketDAO.updateTicketStatus(ticket_id, updatedStatus);

                if(statusUpdateResult)
                    return 'statusUpdateSuccess';
                else
                    return 'statusUpdateFailure';
            }
            else
                return 'ticketAlreadyProcessed';
        }
        else
            return 'roleUnauthorized';
    }
    else
        return 'userAuthFailed';
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