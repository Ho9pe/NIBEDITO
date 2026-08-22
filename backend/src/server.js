const app = require('./app');
const connectDatabase = require('./config/db');
const { serverPort } = require('./secret');
const logger = require("./helper/logger");

app.listen(serverPort, async () => {
    logger.info(`Server is running on http://localhost:${serverPort}/`);
    await connectDatabase();
});