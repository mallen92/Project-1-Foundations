const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-west-1'
});

const docClient = new AWS.DynamoDB.DocumentClient();

// Create a new ticket
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

// Retrieve a single ticket
function retrieveTicket(ticket_id) {
    const params = {
        TableName: 'tickets',
        Key: {
            ticket_id
        }
    }

    return docClient.get(params).promise();
}

// Retrieve all tickets of a specific status
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

// Retrieve all tickets belonging to a specific employee
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

// Retrieve all tickets, belonging to a specific employee, that are of a specific status
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
    retrieveAllTickets,
    retrieveTicket,
    retrieveTicketsByStatus,
    retrieveTicketsByEmployee,
    retrieveEmployeeTicketsByStatus,
    updateTicketStatus
}