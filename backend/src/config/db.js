const mongoose = require('mongoose');
const { mongodbURL } = require('../secret');
const logger = require("../helper/logger");


// The connection string carries the database password, so never log it whole:
// anything printed here lands in the host's retained log stream. Host and
// database name are enough to tell which cluster we reached.
const describeTarget = (uri) => {
    try{
        const { host, pathname } = new URL(uri);
        return `${host}${pathname}`;
    }catch{
        return '<no MONGODB_ATLAS_URL configured>';
    }
}

const connectDatabase = async (options = {}) => {
    try{
        logger.info('Connecting to MongoDB...: ', describeTarget(mongodbURL));
        await mongoose.connect(mongodbURL, options);
        logger.info('MongoDB connected');
        mongoose.connection.on('error', error => {
            console.error('MongoDB connection error: ', error);
        });
    }catch(error){
        logger.error('Could not connect to MongoDB: ', error.toString());
    }
}

module.exports = connectDatabase;