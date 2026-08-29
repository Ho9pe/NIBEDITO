const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const serverPort = process.env.SERVER_PORT;
const mongodbURL = process.env.MONGODB_ATLAS_URL;
const defaultPicture = process.env.DEFAULT_USER_PICTURE;
const jwtActivationKey = process.env.JWT_ACTIVATION_KEY;
const jwtAccessKey = process.env.JWT_ACCESS_KEY;
const jwtRefreshKey = process.env.JWT_REFRESH_KEY;
const smtpEmail = process.env.SMTP_EMAIL;
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpPassword = process.env.SMTP_PASSWORD;
const clientURL = process.env.CLIENT_URL;

// Printed on invoice PDFs. Defaulted rather than required: an unconfigured
// deployment should still produce a usable invoice, not fail to generate one.
const storeName = process.env.STORE_NAME || 'Nibedito';
const storeAddress = process.env.STORE_ADDRESS || 'Dhaka, Bangladesh';
const storeEmail = process.env.STORE_EMAIL || process.env.SMTP_EMAIL || '';
const storePhone = process.env.STORE_PHONE || '';

const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

const superAdminEmail = process.env.SUPER_ADMIN_EMAIL
const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
const superAdminPhone = process.env.SUPER_ADMIN_PHONE;
const defaultUserPassword = process.env.DEFAULT_USER_PASSWORD;
const nodeEnv = process.env.NODE_ENV;



module.exports = { 
    serverPort,
    mongodbURL, 
    defaultPicture, 
    jwtActivationKey, 
    jwtAccessKey,
    jwtRefreshKey,
    smtpEmail,
    smtpHost,
    smtpPort,
    smtpPassword,
    clientURL,
    storeName,
    storeAddress,
    storeEmail,
    storePhone,
    cloudinaryCloudName,
    cloudinaryApiKey,
    cloudinaryApiSecret,
    superAdminEmail,
    superAdminPassword,
    superAdminPhone,
    defaultUserPassword,
    nodeEnv
};