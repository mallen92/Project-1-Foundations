const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-west-1'
});

const docClient = new AWS.DynamoDB.DocumentClient();

// Create new employee
function addEmployee(employee_id, user, pass, role = 'Employee') {

    const params = {
        TableName: 'employees',
        Item: {
            employee_id,
            user,
            pass,
            role
        }
    }

    return docClient.put(params).promise();
}

module.exports = {
    addEmployee
}