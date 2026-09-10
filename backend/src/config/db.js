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

// Backoff between reconnect attempts, capped rather than unbounded. The cluster
// being unreachable is not always a permanent condition - an Atlas maintenance
// window, or a droplet that booted before its entry in the IP access list took
// effect - and a process that gives up after one attempt has to be restarted by
// hand to recover from something that fixed itself.
const RETRY_DELAYS_MS = [1000, 2000, 4000, 8000, 16000, 30000];
const MAX_RETRY_DELAY_MS = 60000;

const delayFor = (attempt) =>
    RETRY_DELAYS_MS[attempt] ?? MAX_RETRY_DELAY_MS;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDatabase = async (options = {}) => {
    const settings = {
        // The default is 30 seconds, and it applies to every query while the
        // driver has no server: requests do not fail, they queue and then time
        // out one by one, so an unreachable cluster looks like a site that
        // hangs rather than one that is broken. Ten seconds is still far more
        // than selection needs when the cluster is up - Singapore to Bangalore
        // is a 60-80 ms round trip - and it turns the failure prompt.
        serverSelectionTimeoutMS: 10000,
        ...options,
    };

    logger.info('Connecting to MongoDB...: ', describeTarget(mongodbURL));

    for (let attempt = 0; ; attempt++) {
        try{
            await mongoose.connect(mongodbURL, settings);
            logger.info('MongoDB connected');

            // Mongoose reconnects on its own once it has connected at least
            // once, so these are for visibility rather than recovery. The retry
            // loop above exists because the *first* connection has no such
            // safety net: mongoose.connect rejects and stays rejected.
            mongoose.connection.on('error', (error) => {
                logger.error('MongoDB connection error: ', error);
            });
            mongoose.connection.on('disconnected', () => {
                logger.warn('MongoDB disconnected; the driver will retry');
            });
            mongoose.connection.on('reconnected', () => {
                logger.info('MongoDB reconnected');
            });
            return;
        }catch(error){
            const wait = delayFor(attempt);

            // The first failure is the one worth waking up for; the repeats
            // after it are the same fact restated, so they stay at warn. The
            // server is already listening either way, and /health reports the
            // database as disconnected throughout.
            const log = attempt === 0 ? logger.error : logger.warn;
            log(
                `Could not connect to MongoDB (attempt ${attempt + 1}): ` +
                `${error.message}. Retrying in ${wait / 1000}s.`
            );

            // Worth checking first when this persists, because both fail the
            // same silent way: the droplet's public IP missing from the Atlas
            // access list, or a password that needs URL-encoding in the URI.
            if (attempt === 0) {
                logger.error(
                    `Target: ${describeTarget(mongodbURL)} - if this does not ` +
                    `clear, check the Atlas IP access list and the credentials.`
                );
            }

            await sleep(wait);
        }
    }
}

module.exports = connectDatabase;
