
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteUser() {
    try {
        const email = 'test@gnail.com';
        const deletedUser = await prisma.user.delete({
            where: { email: email },
        });
        console.log('Deleted user:', deletedUser);
    } catch (e) {
        if (e.code === 'P2025') {
            console.log('User not found, nothing to delete.');
        } else {
            console.error('Error deleting user:', e);
        }
    } finally {
        await prisma.$disconnect();
    }
}

deleteUser();
