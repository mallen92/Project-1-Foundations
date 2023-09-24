const employeeDAO = require('../repository/EmployeeDAO');
const jwtUtil = require('../utility/jwt_util');

async function registerEmployee(enteredUsername, enteredPass) {
    /* First, check if a user with the entered username already exists
    in the database */
    const userInDB = await employeeDAO.getEmployee(enteredUsername);

    if(userInDB.Item)
        return 'userAlreadyExists';
    else {
        const createdEmployee = await employeeDAO.createEmployee(enteredUsername, enteredPass);

        if(createdEmployee)
            return 'regSuccess';
        else
            return 'regFailure';
    }
}

async function loginEmployee(enteredUsername, enteredPass) {
    const userInDB = await employeeDAO.getEmployee(enteredUsername);

    if(userInDB.Item) {
        const userInDBUsername = userInDB.Item.username;
        const userInDBPassword = userInDB.Item.password;
        const userInDBRole = userInDB.Item.role;
        
        if(enteredPass === userInDBPassword) {
            return {
                status: 'loginSuccess',
                data: jwtUtil.createJWT(userInDBUsername, userInDBRole)
            };
        }
        else
            return { status: 'passIncorrect' };
    }
    else
        return { status: 'notAUser' };
}

module.exports = {
    registerEmployee,
    loginEmployee
}