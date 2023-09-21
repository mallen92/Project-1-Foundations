const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-west-1'
});

const docClient = new AWS.DynamoDB.DocumentClient();

// Create new ticket
function createTicket(ticket_id, employee_username, ticket_desc, ticket_amount, ticket_status = 'Pending') {

    const params = {
        TableName: 'tickets',
        Item: {
            ticket_id,
            employee_username,
            ticket_desc,
            ticket_amount,
            ticket_status
        }
    }

    return docClient.put(params).promise();
}

// Retrieve all of an employee's tickets (employees)
function employeeRetrieveTickets(username) {
    const params = {
        TableName: 'tickets',
        FilterExpression: '#emp_user = :user',
        ExpressionAttributeNames: {
            '#emp_user': 'employee_username'
        },
        ExpressionAttributeValues: {
            ':user': username
        }
    }

    return docClient.scan(params).promise();
}

// Retrieve all pending (unprocessed) tickets (managers)
function managerRetrieveTickets() {

    const params = {
        TableName: 'tickets',
        FilterExpression: '#status = :status',
        ExpressionAttributeNames: {
            '#status': 'ticket_status'
        },
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
        UpdateExpression: 'set #status = :status',
        ExpressionAttributeNames: {
            '#status': 'ticket_status'
        },
        ExpressionAttributeValues: {
            ':status': status
        }
    }

    return docClient.update(params).promise();
}

module.exports = { 
    createTicket,
    employeeRetrieveTickets,
    managerRetrieveTickets,
    updateTicketStatus
}