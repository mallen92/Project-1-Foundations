const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-west-1'
});

const docClient = new AWS.DynamoDB.DocumentClient();

// Create new ticket
function createTicket(ticket_id, employee_id, ticket_desc, ticket_amount, ticket_status = 'Pending') {

    const params = {
        TableName: 'tickets',
        Item: {
            ticket_id,
            employee_id,
            ticket_desc,
            ticket_amount,
            ticket_status
        }
    }

    return docClient.put(params).promise();
}

// Retrive pending tickets
function retrievePendingTickets() {

    const params = {
        TableName: 'tickets',
        FilterExpression: 'ticket_status = :status',
        ExpressionAttributeValues: {
            ':status': "Pending"
        }
    }

    return docClient.scan(params).promise();
}

// Updae ticket status
function updateTicketStatus(ticket_id, status) {

    const params = {
        TableName: 'tickets',
        Key: {
            "ticket_id": ticket_id
        },
        UpdateExpression: 'set ticket_status = :status',
        ExpressionAttributeValues: {
            ':status': status
        }
    }

    return docClient.update(params).promise();
}

module.exports = { 
    createTicket,
    retrievePendingTickets,
    updateTicketStatus
}