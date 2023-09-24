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

/* Returns the JWT upon successful login, -100 if the password is incorrect,
and -200 if no user with the provided credentials exists */
async function loginEmployee(enteredUsername, enteredPass) {
    const userInDB = await employeeDAO.getEmployee(enteredUsername);

    if(userInDB.Item) {
        const userInDBUsername = userInDB.Item.username;
        const userInDBPassword = userInDB.Item.password;
        
        if(enteredPass === userInDBPassword)
            return jwtUtil.createJWT(userInDBUsername, userInDBPassword);
        else
            return Number(-100);
    }
    else
        return Number(-200);
}

module.exports = {
    registerEmployee,
    loginEmployee
}