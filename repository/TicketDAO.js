const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-west-1'
});

const docClient = new AWS.DynamoDB.DocumentClient();

// Create new ticket
function createTicket(ticket_id, employee_id, description, amount, status = 'Pending') {

    const params = {
        TableName: 'tickets',
        Item: {
            ticket_id,
            employee_id,
            description,
            amount,
            status
        }
    }

    return docClient.put(params).promise();
}

module.exports = { 
    createTicket
}