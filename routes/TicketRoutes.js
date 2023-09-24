const { Router } = require('express');
const ticketService = require('../services/TicketService');
const router = Router();
module.exports = router;

// View tickets
router.get('/tickets', (req, res) => {
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

// Create a ticket (employees only)
router.post('/tickets', (req, res) => {
    const description = req.body.description;
    const amount = req.body.amount;
    const token = req.headers.authorization.split(' ')[1]; // ['Bearer', '<token>']

    if(description && amount && token) { ticketService.createTicket(description, amount, token, res); }
    else if(!description) { ticketService.displayErrorMissingReimbItems('description', res); }
    else if(!amount) { ticketService.displayErrorMissingReimbItems('amount', res); }
});

// Update ticket status (managers only)
router.put('/tickets', (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // ['Bearer', '<token>']
    const ticket_id = req.body.ticket_id;
    const status = req.body.status;

    ticketService.updateTicketStatus(token, status, ticket_id, res);
});