const Server = require('./server/server');
const Login = require('./server/login');
const settings = require('./settings');

const server = new Server(new Login(), { worlds: settings.worlds });
server.start(process.env.PORT || settings.port);
