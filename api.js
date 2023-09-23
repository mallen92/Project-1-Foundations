const express = require('express');
const server = express();
const bodyParser = require('body-parser');
const employeeService = require('./services/EmployeeService');
const ticketService = require('./services/TicketService');
const logger = require('./log');
const PORT = 8000;

server.use(bodyParser.json());

/* ------------------- HANDLERS ------------------- */

// Employee registration
server.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if(username && password) { employeeService.registerEmployee(username, password, res); }
    else if(!username) { employeeService.displayErrorMissingCredentials('username', 'registration', res); }
    else if(!password) { employeeService.displayErrorMissingCredentials('password', 'registration', res); }
});

// Employee login
server.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if(username && password) { employeeService.loginEmployee(username, password, res); }
    else if(!username) { employeeService.displayErrorMissingCredentials('username', 'login', res); }
    else if(!password) { employeeService.displayErrorMissingCredentials('password', 'login', res); }
});

// Create a ticket
server.post('/tickets', (req, res) => {
    const description = req.body.description;
    const amount = req.body.amount;
    const token = req.headers.authorization.split(' ')[1]; // ['Bearer', '<token>']

    if(description && amount && token) { ticketService.createTicket(description, amount, token, res); }
    else if(!description) { ticketService.displayErrorMissingReimbItems('description', res); }
    else if(!amount) { ticketService.displayErrorMissingReimbItems('amount', res); }
});

// Retrieve tickets
server.get('/tickets', (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // ['Bearer', '<token>']
    const employee = req.query.emp;
    const role = req.query.role;
    const status = req.query.status;
    const ticket_id = req.query.tid;

    if(role === 'employee') {
        if(!status && !ticket_id)
            ticketService.viewTicketsByEmployee(token, res);
        else if(!status && ticket_id)
            ticketService.viewEmployeeTicket(ticket_id, token, res);
        else if(status && !ticket_id)
            ticketService.viewTicketsByStatus(status, token, res);
    }
    else if(role === 'manager') {
        if(!status && !employee && !ticket_id)
            ticketService.viewAllTickets(token, res);
        else if(!status && employee && !ticket_id)
            ticketService.viewTicketsByEmployee(token, res, employee)
        else if(!status && !employee && ticket_id)
            ticketService.viewEmployeeTicket(ticket_id, token, res);
        else if(status && !employee && !ticket_id)
            ticketService.viewTicketsByStatus(status, token, res);
    }


});

// Update ticket status
// server.put('/tickets', validateTicketStatus, (req, res) => {
//     const token = req.headers.authorization.split(' ')[1]; // ['Bearer', '<token>']
//     const ticket_id = req.body.ticket_id;
//     const status = req.body.status;

//     if(req.body.valid) {
//         jwtUtil.verifyTokenAndReturnPayload(token)
//         .then((payload) => {
//             if(payload.role === 'Manager') {
//                 ticketDAO.updateTicketStatus(ticket_id, status)
//                     .then(() => {
//                         res.send('Ticket status updated successfully!');
//                         logger.info('Ticket status updated successfully!');
//                     })   
//             }
//             else {
//                 res.statusCode = 401;
//                 res.send('You are unauthorized to modify the status of tickets.');
//                 logger.info('There was an unauthorized attempt to modify ticket status.');
//             }
//         })
//     }
//     else {
//         res.send('Unable to update ticket status');
//         logger.error('Unable to update ticket status.');
//     }
// });

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    logger.info(`Server is running on port ${PORT}.`);
});