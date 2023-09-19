const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-west-1'
});

const docClient = new AWS.DynamoDB.DocumentClient();

// Create new employee
function addEmployee(employee_id, username, password, role = 'Employee') {

    const params = {
        TableName: 'employees',
        Item: {
            employee_id,
            username,
            password,
            role
        }
    }

    return docClient.put(params).promise();
}

// Retreive an employee to log in
function retrieveEmployee(username, password) {
    const params = {
        TableName: 'employees',
        FilterExpression: 'username = :username AND password = :password',
        ExpressionAttributeValues: {
            ':username': username,
            ':password': password
        }
    }

    return docClient.scan(params).promise();
}

module.exports = {
    addEmployee,
    retrieveEmployee
}