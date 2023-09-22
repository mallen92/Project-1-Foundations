const employeeDAO = require('../repository/EmployeeDAO');
const logger = require('../log');

function registerEmployee(username, password, res) {
    employeeDAO.retrieveEmployeeByUsername(username)
        .then((data) => {
            if(data.Item) {
                res.statusCode = 400;
                res.send('The employee is already registered.');
                logger.error('Credentials for existing employee provided during employee registration.');
            }
            else {
                employeeDAO.createEmployee(username, password)
                    .then(() => {
                        res.statusCode = 200;
                        res.send('Employee successfully registered!');
                        logger.info('Employee successfully registered!');
                    })
                    .catch(() => {
                        res.statusCode = 400;
                        res.send('Employee registration unsuccessful.');
                        logger.error('Employee registration unsuccessful.');
                    })
            }
        })
}

module.exports = {
    registerEmployee
}