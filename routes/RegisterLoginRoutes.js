const { Router } = require('express');
const employeeDAO = require('../repository/EmployeeDAO');
const jwtUtil = require('../utility/jwt_util');
const router = Router();
module.exports = router;

router.use((req, res, next) => {
    if(!req.body.username)
        res.status(400).send({message: 'Please provide a username.'});
    else if(!req.body.password)
        res.status(400).send({message: 'Please provide a password.'});
    else
        next();
})

// Employee registration
router.post('/register', async (req, res) => {
    const enteredUsername = req.body.username;
    const enteredPassword = req.body.password;
    const userInDB = await employeeDAO.getEmployee(enteredUsername);

    if(userInDB.Item) {
        res.status(400).send({message: 'User already exists.'});
    }
    else {
        const createdEmployee = await employeeDAO.createEmployee(enteredUsername, enteredPassword);

        if(createdEmployee) {
            res.status(200).send({message: 'User successfully registered!'});
        }
        else {
            res.status(500).send({message: 'User registration unsuccessful.'});
        }
    }
});

// Employee login
router.post('/login', async (req, res) => {
    const enteredUsername = req.body.username;
    const enteredPassword = req.body.password;

    const userInDB = await employeeDAO.getEmployee(enteredUsername);
    
    if(userInDB.Item) {
        const userInDBUsername = userInDB.Item.username;
        const userInDBPassword = userInDB.Item.password;
        
        if(enteredPassword === userInDBPassword) {
            // successful login
            // create the jwt
            const token = jwtUtil.createJWT(userInDBUsername, userInDBPassword);

            res.status(200).send({
                message: 'Successfully authenticated!',
                token: token
            });
        }
        else {
            res.status(400).send({message: 'The entered password was incorrect.'}); 
        }
    }
    else {
        res.status(400).send({message: 'User does not exist.'});
    }
});