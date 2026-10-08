const mongoose = require('mongoose');
const User = require('../../models/userModel');
const { mongodbURL, defaultUserPassword } = require('../../secret');

// Overridable from .env so these can point at real inboxes you control. Useful
// for exercising anything that actually sends mail - password reset, email
// change - which the @example.com defaults cannot receive.
const VERIFIED_EMAIL = process.env.TEST_VERIFIED_EMAIL || 'verified@example.com';
const UNVERIFIED_EMAIL = process.env.TEST_UNVERIFIED_EMAIL || 'unverified@example.com';
const BANNED_EMAIL = process.env.TEST_BANNED_EMAIL || 'banned@example.com';

const users = [
    {
        name: 'Verified User',
        email: VERIFIED_EMAIL,
        password: defaultUserPassword,
        phone: '01801234567',
        addresses: [
            {
                street: 'Test Street 1',
                city: 'Test City',
                district: 'Test State',
                thana: 'Test Thana',
                isDefault: true
            },
            {
                street: 'Test Street 1B',
                city: 'Another City',
                district: 'Another State',
                thana: 'Another Thana',
                isDefault: false
            },
            {
                street: 'Test Street 1C',
                city: 'Third City',
                district: 'Third State',
                thana: 'Third Thana',
                isDefault: false
            }
        ],
        verificationStatus: {
            email: true,
            phone: true
        }
    },
    {
        name: 'Unverified User',
        email: UNVERIFIED_EMAIL,
        password: defaultUserPassword,
        phone: '01807654321',
        addresses: [
            {
                street: 'Test Street 2',
                city: 'Test City',
                district: 'Test State',
                thana: 'Test Thana',
                isDefault: true
            },
            {
                street: 'Test Street 2B',
                city: 'Second City',
                district: 'Second State',
                thana: 'Second Thana',
                isDefault: false
            }
        ],
        verificationStatus: {
            email: false,
            phone: false
        }
    },
    {
        name: 'Banned User',
        email: BANNED_EMAIL,
        password: defaultUserPassword,
        phone: '01807654322',
        addresses: [
            {
                street: 'Test Street 3',
                city: 'Test City',
                district: 'Test State',
                thana: 'Test Thana',
                isDefault: true
            },
            {
                street: 'Test Street 3B',
                city: 'Ban City',
                district: 'Ban State',
                thana: 'Ban Thana',
                isDefault: false
            },
            {
                street: 'Test Street 3C',
                city: 'Block City',
                district: 'Block State',
                thana: 'Block Thana',
                isDefault: false
            }
        ],
        verificationStatus: {
            email: true,
            phone: true
        },
        isBanned: true
    }
];

const seedUsers = async () => {
    try {
        await mongoose.connect(mongodbURL);
        console.log('Database connected for seeding users');

        // Only the three accounts defined above are replaced. This used to be
        // User.deleteMany({}), which wipes every real account in whichever
        // database it is pointed at - including a live one, since running these
        // scripts against a hosted database is the only way to seed a platform
        // that gives you no shell.
        // Matched on phone as well as email. Both carry unique indexes, and the
        // addresses are configurable: deleting by email alone leaves a previous
        // run's account holding the same phone number, and the insert then dies
        // on a duplicate key.
        const emails = users.map(u => u.email);
        const phones = users.map(u => u.phone);
        const removed = await User.deleteMany({
            $or: [{ email: { $in: emails } }, { phone: { $in: phones } }]
        });
        console.log(`Replacing test accounts (${removed.deletedCount} existing removed)`);

        const createdUsers = await User.create(users);
        console.log('Created users:');
        createdUsers.forEach(user => {
            console.log(`- ${user.name}: ${user.email} (${user.isBanned ? 'Banned' : 'Active'})`);
            console.log(`  Addresses: ${user.addresses.length}`);
        });

        // Flush stdout before exiting: process.exit() drops pending async writes,
        // which is why this script appeared to do nothing at all when piped.
        await new Promise(resolve => process.stdout.write('', resolve));
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();