const { Router } = require('express');
const ticketService = require('../services/TicketService');
const router = Router();
module.exports = router;

// Middleware to ensure submitted reimbursement is not missing info
function checkForMissingInfo(req, res, next) {
    if(!req.body.description)
        res.status(400).send({message: 'Please provide a reimbursement description.'});
    else if(!req.body.amount)
        res.status(400).send({message: 'Please provide a reimbursement amount.'});
    else
        next();
};

// Create a ticket (employees only)
router.post('/', checkForMissingInfo, async (req, res) => {
    const description = req.body.description;
    const amount = req.body.amount;
    const token = req.headers.authorization.split(' ')[1];

    const createTicketResult = await ticketService.createTicket(description, amount, token, res);

    switch(createTicketResult) {
        case 'ticketCreationSuccess':
            res.status(200).send({message: 'Reimbursement successfully submitted!'});
            break;
        case 'ticketCreationFailed':
            res.status(400).send({message: 'There was an error submitting the reimbursement.'});
            break;
        case 'userIsManager':
            res.status(401).send({message: 'Unauthorized: managers cannot submit reimbursement requests.'});
            break;
        case 'userAuthFailed':
            res.status(401).send({message: 'Authentication failed.'});
            break;
        default:
            res.status(500).send({message: 'There was an unexpected error.'});
    }
});

/* View all tickets OR view tickets by status
- Managers should retreive ALL tickets in the database
- Employees should retrieve only THEIR tickets */
router.get('/', async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    let getTicketResult;

    if(req.query.status)
        getTicketResult = await ticketService.viewTicketsByStatus(token, req.query.status);
    else
        getTicketResult = await ticketService.viewAllTickets(token);

    sendTicketRouteResponse(getTicketResult, res);
});

/* View an employee's tickets
- Managers should retreive ALL of a single employee's tickets
- Employees should retreive only THEIR tickets */
router.get('/:employee', async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const queriedEmployee = req.params.employee;
    const getTicketResult = await ticketService.viewTicketsByEmployee(token, queriedEmployee);

    sendTicketRouteResponse(getTicketResult, res);
});

/* View a single ticket
- Managers should retrieve ANY ticket from the database
- Employees should retreive only a ticket that belongs to them. */
router.get('/:employee/:tid', async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const queriedEmployee = req.params.employee;
    const queriedTicketId = req.params.tid;
});

// router.get('/tickets', (req, res) => {
//     const token = req.headers.authorization.split(' ')[1];
//     const employee = req.query.emp;
//     const role = req.query.role;
//     const status = req.query.status;
//     const ticket_id = req.query.tid;

//     if(role === 'employee') {
//         if(!status && !ticket_id)
//             ticketService.viewTicketsByEmployee(token, res);
//         else if(!status && ticket_id)
//             ticketService.viewEmployeeTicket(ticket_id, token, res);
//         else if(status && !ticket_id)
//             ticketService.viewTicketsByStatus(status, token, res);
//     }
//     else if(role === 'manager') {
//         if(!status && !employee && !ticket_id)
//             ticketService.viewAllTickets(token, res);
//         else if(!status && employee && !ticket_id)
//             ticketService.viewTicketsByEmployee(token, res, employee)
//         else if(!status && !employee && ticket_id)
//             ticketService.viewEmployeeTicket(ticket_id, token, res);
//         else if(status && !employee && !ticket_id)
//             ticketService.viewTicketsByStatus(status, token, res);
//     }
// });

// Update ticket status (managers only)
router.put('/tickets', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const ticket_id = req.body.ticket_id;
    const status = req.body.status;

    ticketService.updateTicketStatus(token, status, ticket_id, res);
});

function sendTicketRouteResponse(routeResponse, res) {
    switch(routeResponse.status) {
        case 'retrievalSuccess':
            res.status(200).send(routeResponse.data);
            break;
        case 'noTicketsFound':
            res.status(404).send({message: 'No tickets found.'});
            break;
        case 'retrievalFailure':
            res.status(400).send({message: 'Unable to retieve tickets.'});
            break;
        case 'userIsManager':
            res.status(401).send({message: 'Managers are unable to submit reimbursement tickets.'});
            break;
        case 'empUnauthorized':
            res.status(401).send({message: 'You are unauthorized from viewing this employee\'s tickets.'});
            break;
        case 'roleUnauthorized':
            res.status(401).send({message: 'You must be an employee or a manager to view tickets.'});
            break;
        case 'userAuthFailed':
            res.status(401).send({message: 'Authentication failed.'});
            break;
        default:
            res.status(500).send({message: 'There was an unexpected error.'});
    }
}