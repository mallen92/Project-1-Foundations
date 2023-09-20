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

// Retrieve tickets by employee_id (employees)
function retrieveTicketsByEmployeeID(id) {
    const params = {
        TableName: 'tickets',
        FilterExpression: '#emp_id = :id',
        ExpressionAttributeNames: {
            '#emp_id': 'employee_id'
        },
        ExpressionAttributeValues: {
            ':id': id
        }
    }

    return docClient.scan(params).promise();
}

// Retrieve pending tickets (managers)
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

// Update ticket status
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
    retrieveTicketsByEmployeeID,
    retrievePendingTickets,
    updateTicketStatus
}