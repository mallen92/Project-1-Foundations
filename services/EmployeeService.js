const employeeDAO = require('../repository/EmployeeDAO');
const jwtUtil = require('../utility/jwt_util');
const logger = require('../log');

function registerEmployee(username, password, res) {
    if(username && password) {
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
    else if(!username) { displayErrorMissingCredentials('username', 'registration', res); }
    else if(!password) { displayErrorMissingCredentials('password', 'registration', res); }
}

function loginEmployee(username, password, res) {
    if(username && password) {
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
    else if(!username) { employeeService.displayErrorMissingCredentials('username', 'login', res); }
    else if(!password) { employeeService.displayErrorMissingCredentials('password', 'login', res); }

}

function displayErrorMissingCredentials(credential, action, res) {
    res.statusCode = 400;
    res.send(`Please provide a ${credential}.`);
    logger.error(`No ${credential} was provided during employee ${action}.`);
}

module.exports = {
    registerEmployee,
    loginEmployee,
    displayErrorMissingCredentials
}