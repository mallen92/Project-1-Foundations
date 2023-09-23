const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-west-1'
});

const docClient = new AWS.DynamoDB.DocumentClient();

// Create new ticket
function createTicket(ticket_id, creator_username, ticket_desc, ticket_amount, ticket_status = 'Pending') {
    const params = {
        TableName: 'tickets',
        Item: {
            ticket_id,
            creator_username,
            ticket_desc,
            ticket_amount,
            ticket_status
        }
    }

    return docClient.put(params).promise();
}

// Retrieve all tickets
function retrieveAllTickets() {
    const params = {
        TableName: 'tickets'
    }

    return docClient.scan(params).promise();
}

// Retrieve all of an employee's tickets
function retrieveTicketsByEmployee(creator_username) {
    const params = {
        TableName: 'tickets',
        FilterExpression: '#employee = :employee',
        ExpressionAttributeNames: {
            '#employee': 'creator_username'
        },
        ExpressionAttributeValues: {
            ':employee': creator_username
        }
    }

    return docClient.scan(params).promise();
}

// Filter an employee's tickets by status
function retrieveEmployeeTicketsByStatus(creator_username, status) {
    const params = {
        TableName: 'tickets',
        FilterExpression: '#employee = :employee AND #status = :status',
        ExpressionAttributeNames: {
            '#employee': 'creator_username',
            '#status': 'ticket_status'
        },
        ExpressionAttributeValues: {
            ':employee': creator_username,
            ':status': status
        }
    }

    return docClient.scan(params).promise(); 
}

function retrieveTicketsByStatus(status) {
    const params = {
        TableName: 'tickets',
        FilterExpression: '#status = :status',
        ExpressionAttributeNames: {
            '#status': 'ticket_status'
        },
        ExpressionAttributeValues: {
            ':status': status
        }
    }

    return docClient.scan(params).promise();
}

function retrieveTicket(ticket_id) {
    const params = {
        TableName: 'tickets',
        Key: {
            ticket_id
        }
    }

    return docClient.get(params).promise();
}

// Update ticket status
function updateTicketStatus(ticket_id, status) {

    const params = {
        TableName: 'tickets',
        Key: {
            'ticket_id': ticket_id
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
    retrieveTicketsByEmployee,
    retrieveAllTickets,
    retrieveEmployeeTicketsByStatus,
    retrieveTicketsByStatus,
    retrieveTicket,
    updateTicketStatus
}