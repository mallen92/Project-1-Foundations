const { Router } = require('express');
const authService = require('../services/AuthService');
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

    const registrationResult = await authService.registerEmployee(enteredUsername, enteredPassword);

    if(registrationResult === 'userAlreadyExists')
        res.status(400).send({message: 'User already exists.'});
    else if(registrationResult === 'regSuccess')
        res.status(200).send({message: 'User successfully registered!'});
    else
        res.status(500).send({message: 'User registration unsuccessful.'});
});

// Employee login
router.post('/login', async (req, res) => {
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