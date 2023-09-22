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

function displayErrorMissingReimbItems(item, res) {
    res.statusCode = 400;
    res.send(`Please provide a reimbursement ${item}.`);
    logger.error(`No reimbursment ${item} was provided during ticket creation.`);
}

module.exports = {
    createTicket,
    displayErrorMissingReimbItems
}