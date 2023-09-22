const employeeDAO = require('../repository/EmployeeDAO');
const jwtUtil = require('../utility/jwt_util');
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

function loginEmployee(username, password, res) {
    employeeDAO.retrieveEmployeeByUsername(username)
        .then((data) => {
            const userItem = data.Item;

            if(password === userItem.password) {
                // successful login
                // create the jwt
                const token = jwtUtil.createJWT(userItem.username, userItem.role);

                res.send({
                    message: "Successfully authenticated!",
                    token: token
                });
            }
            else {
                res.statusCode = 400;
                res.send("Invalid credentials.");
            }
        })
        .catch((err) => {
            console.error(err);
            res.send("Failed to authenticate user.")
            logger.error('Failed to authenticate user.');
        });
}

module.exports = {
    registerEmployee,
    loginEmployee
}