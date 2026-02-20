
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin(email) {
    if (!email) {
        console.error('Please provide an email address.');
        console.log('Usage: node make_admin.js <email>');
        process.exit(1);
    }

    try {
        const user = await prisma.user.update({
            where: { email: email },
            data: { role: 'admin' },
        });
        console.log(`User ${email} has been promoted to admin.`);
        console.log('Updated user:', user);
    } catch (e) {
        if (e.code === 'P2025') {
            console.error(`User with email ${email} not found.`);
        } else {
            console.error('An error occurred:', e);
        }
    } finally {
        await prisma.$disconnect();
    }
}

const email = process.argv[2];
makeAdmin(email);
