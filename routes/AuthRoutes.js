const { Router } = require('express');
const authService = require('../services/AuthService');
const router = Router();
module.exports = router;

// Middleware to ensure credentials were submitted
function checkForMissingCreds(req, res, next) {
    if(!req.body.username)
        res.status(400).send({message: 'Please provide a username.'});
    else if(!req.body.password)
        res.status(400).send({message: 'Please provide a password.'});
    else
        next();
}

// Employee registration
router.post('/register', checkForMissingCreds, async (req, res) => {
    const enteredUsername = req.body.username;
    const enteredPassword = req.body.password;

    const registrationResult = await authService.registerEmployee(enteredUsername, enteredPassword);

    switch(registrationResult) {
        case 'userAlreadyExists':
            res.status(400).send({message: 'User already exists.'});
            break;
        case 'regSuccess':
            res.status(200).send({message: 'User successfully registered!'});
            break;
        case 'regFailure':
            res.status(500).send({message: 'User registration unsuccessful.'});
            break;
        default:
            res.status(500).send({message: 'There was an unexpected error.'});
    }
});

// Employee login
router.post('/login', checkForMissingCreds, async (req, res) => {
    const enteredUsername = req.body.username;
    const enteredPassword = req.body.password;

    const loginResult = await authService.loginEmployee(enteredUsername, enteredPassword);
        
    if(loginResult === -100)
        res.status(400).send({message: 'The entered password was incorrect.'}); 
    else if(loginResult === -200)
        res.status(400).send({message: 'User does not exist.'});
    else {
        res.status(200).send({
            message: 'Successfully authenticated!',
            token: loginResult
        });
    }
});