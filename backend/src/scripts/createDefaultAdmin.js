const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/adminModel');
const { mongodbURL, superAdminEmail, superAdminPassword, superAdminPhone } = require('../secret');

const createDefaultAdmins = async () => {
    try {
        await mongoose.connect(mongodbURL);
        console.log('Database connected for admin creation');

        // Hash password with bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(superAdminPassword, salt);

        console.log('Creating admin with:', { // password intentionally omitted: it is already in your .env and printing it puts it in shell history and logs
            email: superAdminEmail,
            phone: superAdminPhone,
        });

        // Built and validated before anything is deleted. This used to call
        // deleteMany({}) first, so a SUPER_ADMIN_PHONE the schema rejected -
        // and the value .env.example shipped was one - wiped every admin and
        // then failed to create the replacement, leaving no way into
        // /admin-login at all. On a live site that is a lockout whose fix is
        // another deploy.
        const defaultAdmin = new Admin({
            name: 'Super Admin',
            email: superAdminEmail,
            password: hashedPassword,
            phone: superAdminPhone,
            role: 'superadmin'
        });

        // Catches the ordinary mistake - a phone or name the schema rejects -
        // before anything is touched, and reports it plainly.
        await defaultAdmin.validate();

        // The replace itself is one transaction. validate() does not run the
        // pre-save hook, and that hook enforces a password rule of its own, so
        // without this a hook failure would still land between the delete and
        // the save. Atlas and the local compose stack are both replica sets, as
        // checkout already requires.
        const session = await mongoose.startSession();
        let createdAdmin;
        try {
            await session.withTransaction(async () => {
                await Admin.deleteMany({}, { session });
                createdAdmin = await defaultAdmin.save({ session });
            });
        } finally {
            session.endSession();
        }
        console.log('Cleared existing admins');
        console.log('Created admin:', {
            email: createdAdmin.email,
            role: createdAdmin.role,
            id: createdAdmin._id
        });

        // Verify the password can be compared
        const isMatch = await bcrypt.compare(superAdminPassword, createdAdmin.password);
        console.log('Verification test:', {
            isMatch: isMatch
        });

        await mongoose.disconnect();
        console.log('Database disconnected');
        process.exit(0);
    } catch (error) {
        // A schema rejection is a wrong value in .env, not a crash, and the
        // full Mongoose stack buries the one line that says which field. Print
        // the field and its rule; keep the stack for everything else.
        if (error.name === 'ValidationError' && error.errors) {
            console.error('Admin not created. Fix backend/.env:');
            for (const [field, err] of Object.entries(error.errors)) {
                console.error(`  ${field}: ${err.message}`);
            }
            console.error('\nNothing was deleted - the existing admins, if any, are untouched.');
        } else {
            console.error('Error creating admin:', error);
        }
        process.exit(1);
    }
};

createDefaultAdmins();