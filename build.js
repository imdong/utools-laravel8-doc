const Bot = require('./lib/reptile_bot');
const config = require('./config');

(new Bot(config)).run();
