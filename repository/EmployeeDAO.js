const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-west-1'
});

const docClient = new AWS.DynamoDB.DocumentClient();

// Create new employee
function createEmployee(username, password, role = 'Employee') {

    const params = {
        TableName: 'employees',
        Item: {
            username,
            password,
            role
        }
    };

    return docClient.put(params).promise();
}

// Retrieve an employee
function retrieveEmployeeByUsername(username) {
    const params = {
        TableName: 'employees',
        Key: {
            username
        }
    };
    
    return docClient.get(params).promise();
}

module.exports = {
    createEmployee,
    retrieveEmployeeByUsername
}