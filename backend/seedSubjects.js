const mongoose = require('mongoose');
const Subject = require('./models/Subject');
require('dotenv').config();

const subjects = [
    // 1st Year - Common for all branches
    { code: 'FEC101', name: 'Engineering Mathematics', credits: 4, year: '1', branch: 'Common' },
    { code: 'FEC102', name: 'Engineering Physics', credits: 4, year: '1', branch: 'Common' },
    { code: 'FEC103', name: 'Engineering Chemistry', credits: 4, year: '1', branch: 'Common' },
    { code: 'FEC104', name: 'Basic Electrical & Electronics Engg', credits: 3, year: '1', branch: 'Common' },
    { code: 'FEC105', name: 'Introduction to Programming', credits: 3, year: '1', branch: 'Common' },
    { code: 'FEC106', name: 'Engineering Mechanics', credits: 2, year: '1', branch: 'Common' },
    { code: 'FEC107', name: 'Engineering Graphics', credits: 2, year: '1', branch: 'Common' },

    // CSE - 2nd Year
    { code: 'CSE201', name: 'Discrete Structures & Graph Theory', credits: 4, year: '2', branch: 'CSE' },
    { code: 'CSE202', name: 'Data Structures & Analysis of Algorithms', credits: 4, year: '2', branch: 'CSE' },
    { code: 'CSE203', name: 'Digital Logic & Computer Architecture', credits: 4, year: '2', branch: 'CSE' },
    { code: 'CSE204', name: 'Computer Graphics', credits: 2, year: '2', branch: 'CSE' },
    { code: 'CSE205', name: 'Database Management Systems', credits: 3, year: '2', branch: 'CSE' },
    { code: 'CSE206', name: 'Operating System', credits: 3, year: '2', branch: 'CSE' },
    { code: 'CSE207', name: 'Microprocessor', credits: 2, year: '2', branch: 'CSE' },

    // CSE - 3rd Year
    { code: 'CSE301', name: 'Theortical Computer Science', credits: 4, year: '3', branch: 'CSE' },
    { code: 'CSE302', name: 'Software Engineering', credits: 4, year: '3', branch: 'CSE' },
    { code: 'CSE303', name: 'Computer Network & Cryptography-System Security', credits: 4, year: '3', branch: 'CSE' },
    { code: 'CSE304', name: 'Data Warehousing & Mining', credits: 3, year: '3', branch: 'CSE' },
    { code: 'CSE305', name: 'System Programming & Compiler Construction', credits: 3, year: '3', branch: 'CSE' },
    { code: 'CSE306', name: 'Mobile Computing', credits: 2, year: '3', branch: 'CSE' },
    { code: 'CSE307', name: 'Artificial Intelligence', credits: 2, year: '3', branch: 'CSE' },

    // CSE - 4th Year
    { code: 'CSE401', name: 'Machine & Deep Learning Learning', credits: 4, year: '4', branch: 'CSE' },
    { code: 'CSE402', name: 'Big Data Analytics', credits: 4, year: '4', branch: 'CSE' },
    { code: 'CSE403', name: 'Distributed Computing', credits: 4, year: '4', branch: 'CSE' },
    { code: 'CSE404', name: 'Natural Language Processing', credits: 3, year: '4', branch: 'CSE' },
    { code: 'CSE405', name: 'Blockchain Technology', credits: 3, year: '4', branch: 'CSE' },
    { code: 'CSE406', name: 'Social Media Analytics', credits: 2, year: '4', branch: 'CSE' },
    { code: 'CSE407', name: 'Cyber Security & Laws', credits: 2, year: '4', branch: 'CSE' },

    // ECE - 2nd Year
    { code: 'ECE201', name: 'Electronic Devices & Circuits', credits: 4, year: '2', branch: 'ECE' },
    { code: 'ECE202', name: 'Digital System Design', credits: 4, year: '2', branch: 'ECE' },
    { code: 'ECE203', name: 'Linear Integrated Circuits', credits: 4, year: '2', branch: 'ECE' },
    { code: 'ECE204', name: 'Network Theory', credits: 3, year: '2', branch: 'ECE' },
    { code: 'ECE205', name: 'Electronic Instrumentation & Control Systems', credits: 3, year: '2', branch: 'ECE' },
    { code: 'ECE206', name: 'Microcontrollers', credits: 2, year: '2', branch: 'ECE' },
    { code: 'ECE207', name: 'Signals, Systems and Principals of Comm Engg', credits: 2, year: '2', branch: 'ECE' },

    // ECE - 3rd Year
    { code: 'ECE301', name: 'Digital Communication & Networks', credits: 4, year: '3', branch: 'ECE' },
    { code: 'ECE302', name: 'Discrete Time Signal Processing', credits: 4, year: '3', branch: 'ECE' },
    { code: 'ECE303', name: 'Electromagnetics & Antenna', credits: 4, year: '3', branch: 'ECE' },
    { code: 'ECE304', name: 'Digital VLSI', credits: 3, year: '3', branch: 'ECE' },
    { code: 'ECE305', name: 'Image Processing & Machine Vision', credits: 3, year: '3', branch: 'ECE' },
    { code: 'ECE306', name: 'Artificial Neural Network & Fuzzy Logic', credits: 2, year: '3', branch: 'ECE' },
    { code: 'ECE307', name: 'Digital & IPTV Engg', credits: 2, year: '3', branch: 'ECE' },

    // ECE - 4th Year
    { code: 'ECE401', name: 'Microwave Engg', credits: 4, year: '4', branch: 'ECE' },
    { code: 'ECE402', name: 'Mobile Communication System', credits: 4, year: '4', branch: 'ECE' },
    { code: 'ECE403', name: 'Optical Communication and Networks', credits: 4, year: '4', branch: 'ECE' },
    { code: 'ECE404', name: 'Big Data Analytics', credits: 3, year: '4', branch: 'ECE' },
    { code: 'ECE405', name: 'Internet of Things', credits: 3, year: '4', branch: 'ECE' },
    { code: 'ECE406', name: 'Internet Communication Engg', credits: 2, year: '4', branch: 'ECE' },
    { code: 'ECE407', name: 'Network Management in Telecommunication', credits: 2, year: '4', branch: 'ECE' },

    // MECH - 2nd Year
    { code: 'MEC201', name: 'Strength of Materials', credits: 4, year: '2', branch: 'MECH' },
    { code: 'MEC202', name: 'Production Processes', credits: 4, year: '2', branch: 'MECH' },
    { code: 'MEC203', name: 'Fluid Mechanics', credits: 4, year: '2', branch: 'MECH' },
    { code: 'MEC204', name: 'Industrial Electronics', credits: 3, year: '2', branch: 'MECH' },
    { code: 'MEC205', name: 'Materials and Metallurgy', credits: 3, year: '2', branch: 'MECH' },
    { code: 'MEC206', name: 'Kinematics of Machinery', credits: 2, year: '2', branch: 'MECH' },
    { code: 'MEC207', name: 'Thermodynamics', credits: 2, year: '2', branch: 'MECH' },

    // MECH - 3rd Year
    { code: 'MEC301', name: 'Mechanical Measurements & Control', credits: 4, year: '3', branch: 'MECH' },
    { code: 'MEC302', name: 'Thermal Engineering', credits: 4, year: '3', branch: 'MECH' },
    { code: 'MEC303', name: 'Turbo Machinery & Machinery Dynamics', credits: 4, year: '3', branch: 'MECH' },
    { code: 'MEC304', name: 'HVAC & Refrigeration', credits: 3, year: '3', branch: 'MECH' },
    { code: 'MEC305', name: 'Finite Element Analysis', credits: 3, year: '3', branch: 'MECH' },
    { code: 'MEC306', name: 'Machine Design', credits: 2, year: '3', branch: 'MECH' },
    { code: 'MEC307', name: 'Automation & AI', credits: 2, year: '3', branch: 'MECH' },

    // MECH - 4th Year
    { code: 'MEC401', name: 'Design of Mechanical System', credits: 4, year: '4', branch: 'MECH' },
    { code: 'MEC402', name: 'Logistics and SCM', credits: 4, year: '4', branch: 'MECH' },
    { code: 'MEC403', name: 'Operations Planning & Control', credits: 4, year: '4', branch: 'MECH' },
    { code: 'MEC404', name: 'Automotive Power Systems', credits: 3, year: '4', branch: 'MECH' },
    { code: 'MEC405', name: 'Vibration Controls', credits: 3, year: '4', branch: 'MECH' },
    { code: 'MEC406', name: 'Smart Materials', credits: 2, year: '4', branch: 'MECH' },
    { code: 'MEC407', name: 'Total Quality Management', credits: 2, year: '4', branch: 'MECH' },

    // CIVIL - 2nd Year
    { code: 'CVL201', name: 'Mechanics of Solids', credits: 4, year: '2', branch: 'CIVIL' },
    { code: 'CVL202', name: 'Fluid Mechanics', credits: 4, year: '2', branch: 'CIVIL' },
    { code: 'CVL203', name: 'Structural Analysis', credits: 4, year: '2', branch: 'CIVIL' },
    { code: 'CVL204', name: 'Architectural Planning & Design of Buildings', credits: 3, year: '2', branch: 'CIVIL' },
    { code: 'CVL205', name: 'Building Material & Concrete Tech', credits: 3, year: '2', branch: 'CIVIL' },
    { code: 'CVL206', name: 'Engineering Geology', credits: 2, year: '2', branch: 'CIVIL' },
    { code: 'CVL207', name: 'Surveying', credits: 2, year: '2', branch: 'CIVIL' },

    // CIVIL - 3rd Year
    { code: 'CVL301', name: 'Theory of Reinforced Concrete Str', credits: 4, year: '3', branch: 'CIVIL' },
    { code: 'CVL302', name: 'Design & Drawing of Steel Str', credits: 4, year: '3', branch: 'CIVIL' },
    { code: 'CVL303', name: 'Applied Hydraulics', credits: 4, year: '3', branch: 'CIVIL' },
    { code: 'CVL304', name: 'Geotechnical Engg', credits: 3, year: '3', branch: 'CIVIL' },
    { code: 'CVL305', name: 'Transportation & Environmental Engg', credits: 3, year: '3', branch: 'CIVIL' },
    { code: 'CVL306', name: 'Water Resources Engg', credits: 2, year: '3', branch: 'CIVIL' },
    { code: 'CVL307', name: 'Computational Structural Analysis', credits: 2, year: '3', branch: 'CIVIL' },

    // CIVIL - 4th Year
    { code: 'CVL401', name: 'Design & Drawing of RCS', credits: 4, year: '4', branch: 'CIVIL' },
    { code: 'CVL402', name: 'Quantity, Survey, Estimation & Valuation', credits: 4, year: '4', branch: 'CIVIL' },
    { code: 'CVL403', name: 'Construction Management', credits: 4, year: '4', branch: 'CIVIL' },
    { code: 'CVL404', name: 'Analysis of Offshore Structures', credits: 3, year: '4', branch: 'CIVIL' },
    { code: 'CVL405', name: 'Green Building Constructions', credits: 3, year: '4', branch: 'CIVIL' },
    { code: 'CVL406', name: 'Soil Dynamics', credits: 2, year: '4', branch: 'CIVIL' },
    { code: 'CVL407', name: 'Bridge Engg', credits: 2, year: '4', branch: 'CIVIL' }
];

const seedSubjects = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing subjects
        await Subject.deleteMany({});
        console.log('Cleared existing subjects');

        // Insert new subjects
        await Subject.insertMany(subjects);
        console.log(`${subjects.length} subjects seeded successfully`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding subjects:', error);
        process.exit(1);
    }
};

seedSubjects();
