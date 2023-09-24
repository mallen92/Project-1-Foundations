const express = require('express');
const server = express();
const bodyParser = require('body-parser');
const registerLoginRoute = require('./routes/RegisterLoginRoutes');
const ticketsRoute = require('./routes/TicketRoutes');
const PORT = 8000;

server.use(bodyParser.json());
server.use(registerLoginRoute);
server.use(ticketsRoute);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});