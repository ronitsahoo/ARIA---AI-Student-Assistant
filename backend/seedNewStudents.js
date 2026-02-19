const mongoose = require('mongoose');
const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');
require('dotenv').config();

const indianStudents = [
    {
        name: 'Rahul Sharma',
        email: 'rahul.sharma@student.edu',
        password: 'password123',
        role: 'student',
        branch: 'CSE',
        year: '2'
    },
    {
        name: 'Priya Patel',
        email: 'priya.patel@student.edu',
        password: 'password123',
        role: 'student',
        branch: 'ECE',
        year: '3'
    },
    {
        name: 'Amit Kumar',
        email: 'amit.kumar@student.edu',
        password: 'password123',
        role: 'student',
        branch: 'MECH',
        year: '1'
    },
    {
        name: 'Sneha Reddy',
        email: 'sneha.reddy@student.edu',
        password: 'password123',
        role: 'student',
        branch: 'CIVIL',
        year: '4'
    },
    {
        name: 'Vikram Singh',
        email: 'vikram.singh@student.edu',
        password: 'password123',
        role: 'student',
        branch: 'CSE',
        year: '3'
    }
];

const seedNewStudents = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Find all existing student users (excluding admin and staff)
        const existingStudents = await User.find({ role: 'student' });
        console.log(`Found ${existingStudents.length} existing students`);

        // Delete their profiles first
        for (const student of existingStudents) {
            await StudentProfile.deleteOne({ userId: student._id });
        }
        console.log('Deleted all student profiles');

        // Delete all student users
        await User.deleteMany({ role: 'student' });
        console.log('Deleted all student users');

        // Create new Indian students
        console.log('\nCreating new Indian students...');
        for (const studentData of indianStudents) {
            // Create user
            const user = await User.create(studentData);
            console.log(`✓ Created user: ${user.name} (${user.email}) - Year ${user.year}, ${user.branch}`);

            // Create student profile
            const profile = await StudentProfile.create({
                userId: user._id,
                documents: [],
                fee: {
                    amount: 50000,
                    status: 'pending'
                },
                hostel: {
                    status: 'not_applied'
                },
                lmsActivated: false,
                registeredSubjects: [],
                progressPercentage: 0
            });
            console.log(`  ✓ Created profile for ${user.name}`);
        }

        console.log(`\n✅ Successfully created ${indianStudents.length} new Indian students`);
        console.log('\nStudent Credentials (all use password: password123):');
        indianStudents.forEach(s => {
            console.log(`  - ${s.name}: ${s.email} (Year ${s.year}, ${s.branch})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error seeding students:', error);
        process.exit(1);
    }
};

seedNewStudents();
