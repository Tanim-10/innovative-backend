import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.model.js';
import Admin from '../models/Admin.model.js';
import Course from '../models/Course.model.js';
import CourseEnrollment from '../models/CourseEnrollment.model.js';
import SessionSlot from '../models/SessionSlot.model.js';
import Workshop from '../models/Workshop.model.js';
import Internship from '../models/Internship.model.js';

dotenv.config();

const seedAllDummyData = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Cleaning up existing database...');
    
    // Clear courses, enrollments, slots, workshops, internships
    await Course.deleteMany({});
    await CourseEnrollment.deleteMany({});
    await SessionSlot.deleteMany({});
    await Workshop.deleteMany({});
    await Internship.deleteMany({});

    // Delete existing seed users (tutors & students)
    const seedEmails = [
      'croft@innovativehub.com', 
      'aisha@innovativehub.com', 
      'liam@innovativehub.com',
      'student1@innovativehub.com',
      'student2@innovativehub.com'
    ];
    await User.deleteMany({ email: { $in: seedEmails } });

    // Seed Admin
    console.log('Seeding admin...');
    const adminEmail = "admin@innovativehub.com";
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const admin = new Admin({ email: adminEmail, password: "adminPassword123!" });
      await admin.save();
      console.log(`Created admin: ${admin.email}`);
    } else {
      console.log(`Admin already exists: ${existingAdmin.email}`);
    }

    console.log('Seeding approved tutors...');

    const tutorsData = [
      {
        name: 'Dr. Ryan Croft',
        email: 'croft@innovativehub.com',
        password: 'Password123',
        mobile: '9876543210',
        mobileVerified: true,
        role: 'tutor',
        tutorStatus: 'approved',
        bio: 'Dr. Ryan Croft is a former NASA JPL researcher specializing in robot manipulator kinematics and ROS2 interface design. He has over 15 years of experience building autonomous navigation stacks.',
        expertise: ['ROS', 'ROS2', 'Kinematics', 'Autonomous Navigation'],
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        socials: { linkedin: 'https://linkedin.com/in/ryancroft' },
        education: { college: 'MIT', graduationYear: 2010, course: 'Ph.D. Robotics' }
      },
      {
        name: 'Aisha Sharma',
        email: 'aisha@innovativehub.com',
        password: 'Password123',
        mobile: '9876543211',
        mobileVerified: true,
        role: 'tutor',
        tutorStatus: 'approved',
        bio: 'Aisha is an embedded systems engineer and open-source enthusiast. She designs industrial IoT nodes and custom firmware for drone avionics. Expert in Arduino and Espressif ESP32.',
        expertise: ['Arduino', 'ESP32', 'Firmware', 'Avionics', 'IoT'],
        profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
        socials: { linkedin: 'https://linkedin.com/in/aishasharma' },
        education: { college: 'IIT Delhi', graduationYear: 2015, course: 'M.Tech Electronics' }
      },
      {
        name: 'Liam Vance',
        email: 'liam@innovativehub.com',
        password: 'Password123',
        mobile: '9876543212',
        mobileVerified: true,
        role: 'tutor',
        tutorStatus: 'approved',
        bio: 'Liam Vance designs feedback loop controllers for sub-sea exploration robots. He focuses on low-level motor controls, Arduino firmware, and sensor integration techniques.',
        expertise: ['Arduino', 'Control Systems', 'Firmware', 'Sensors'],
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        socials: { linkedin: 'https://linkedin.com/in/liamvance' },
        education: { college: 'Stanford University', graduationYear: 2018, course: 'B.S. Electrical Engineering' }
      }
    ];

    const createdTutors = [];
    for (const tData of tutorsData) {
      const tutor = new User(tData);
      await tutor.save();
      createdTutors.push(tutor);
      console.log(`Created tutor: ${tutor.name}`);
    }
    const [croft, aisha, liam] = createdTutors;

    console.log('Seeding dummy students...');
    const studentsData = [
      {
        name: 'Alex Student',
        email: 'student1@innovativehub.com',
        password: 'Password123',
        role: 'student',
        mobile: '1112223334',
        mobileVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=150&q=80',
      },
      {
        name: 'Jordan Learner',
        email: 'student2@innovativehub.com',
        password: 'Password123',
        role: 'student',
        mobile: '5556667778',
        mobileVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
      }
    ];

    for (const sData of studentsData) {
      const student = new User(sData);
      await student.save();
      console.log(`Created student: ${student.name}`);
    }

    console.log('Seeding courses...');

    const coursesData = [
      {
        tutorId: croft._id,
        title: 'ROS2 Fundamentals: Robotics Operating System for Beginners',
        description: 'Master the fundamentals of ROS2, including nodes, topics, services, actions, and custom interfaces. Build a simulated differential drive robot and navigate it using Nav2.',
        difficulty: 'beginner',
        topic: 'ROS',
        price: 1499,
        thumbnailUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
        isPublished: true,
        lectures: [
          { title: 'Introduction to ROS2 Architecture', description: 'Learn the core design principles.', videoUrl: 'https://www.youtube.com/watch?v=999o8W6j558' },
          { title: 'Understanding Nodes and Executables', description: 'Write your first Python node.', videoUrl: 'https://www.youtube.com/watch?v=999o8W6j558' }
        ]
      },
      {
        tutorId: aisha._id,
        title: 'ESP32 IoT Nodes: Industrial Sensor Networks',
        description: 'Learn to build robust, low-power IoT sensor nodes using the ESP32 microcontroller, FreeRTOS, and MQTT.',
        difficulty: 'intermediate',
        topic: 'IoT',
        price: 999,
        thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
        isPublished: true,
        lectures: [
          { title: 'Setting up ESP-IDF', description: 'Initialize the framework.', videoUrl: 'https://www.youtube.com/watch?v=999o8W6j558' },
          { title: 'FreeRTOS Tasks', description: 'Design multi-threaded apps.', videoUrl: 'https://www.youtube.com/watch?v=999o8W6j558' }
        ]
      },
      {
        tutorId: liam._id,
        title: 'Arduino Firmware: Writing Clean Register Drivers',
        description: 'Go beyond standard library wrappers. Learn register-level programming.',
        difficulty: 'advanced',
        topic: 'Arduino',
        price: 0,
        thumbnailUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=800&q=80',
        isPublished: true,
        lectures: [
          { title: 'AVR Register Level Access', description: 'Bypass digitalWrite.', videoUrl: 'https://www.youtube.com/watch?v=999o8W6j558' },
          { title: 'Hardware Timers', description: 'Configure Timer1.', videoUrl: 'https://www.youtube.com/watch?v=999o8W6j558' }
        ]
      }
    ];

    for (const cData of coursesData) {
      const course = await Course.create(cData);
      console.log(`Created course: ${course.title}`);
    }

    console.log('Seeding available tutoring slots...');

    const getFutureDate = (daysAhead) => {
      const date = new Date();
      date.setDate(date.getDate() + daysAhead);
      date.setHours(0, 0, 0, 0);
      return date;
    };

    const slotsData = [
      { tutorId: croft._id, date: getFutureDate(1), time: '10:00 AM - 11:00 AM', topic: 'ROS', cost: 499, status: 'available' },
      { tutorId: croft._id, date: getFutureDate(2), time: '11:00 AM - 12:00 PM', topic: 'ROS2', cost: 0, status: 'available' },
      { tutorId: aisha._id, date: getFutureDate(1), time: '09:00 AM - 10:00 AM', topic: 'IoT', cost: 399, status: 'available' },
      { tutorId: aisha._id, date: getFutureDate(2), time: '04:00 PM - 05:00 PM', topic: 'ESP32', cost: 399, status: 'available' },
      { tutorId: liam._id, date: getFutureDate(1), time: '11:00 AM - 12:00 PM', topic: 'Arduino', cost: 299, status: 'available' }
    ];

    await SessionSlot.insertMany(slotsData);
    console.log('Seeded available session slots.');

    console.log('Seeding approved workshops...');
    const workshopsData = [
      {
        title: 'ROS2 Nav2 Navigation Stack Deep Dive',
        description: 'Learn how to configure navigation costmaps, AMCL, and BT Navigator in ROS2. This workshop covers practical configuration and simulation in Gazebo.',
        hostName: croft.name,
        hostEmail: croft.email,
        hostId: croft._id,
        hostLinkedIn: croft.socials?.linkedin || 'https://linkedin.com/in/ryancroft',
        thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
        date: getFutureDate(3),
        time: '03:00 PM - 05:00 PM',
        duration: '2 Hours',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        googleFormLink: 'https://forms.gle/dummy-workshop-form',
        showOnHomepage: true,
        status: 'approved'
      },
      {
        title: 'Building ESP32 Firmware with FreeRTOS',
        description: 'An hands-on session on designing multi-tasked firmware on ESP32 microcontrollers. Learn about task priorities, queues, semaphores, and thread safety.',
        hostName: aisha.name,
        hostEmail: aisha.email,
        hostId: aisha._id,
        hostLinkedIn: aisha.socials?.linkedin || 'https://linkedin.com/in/aishasharma',
        thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
        date: getFutureDate(5),
        time: '10:00 AM - 12:00 PM',
        duration: '2 Hours',
        meetingLink: 'https://meet.google.com/xyz-pdqr-lmn',
        googleFormLink: 'https://forms.gle/dummy-workshop-form',
        showOnHomepage: true,
        status: 'approved'
      },
      {
        title: 'Mastering Arduino Hardware Interrupts',
        description: 'Understand how interrupts work in AVR microcontrollers. Learn to write low-latency ISRs, handle switch bouncing, and measure pulse widths precisely.',
        hostName: liam.name,
        hostEmail: liam.email,
        hostId: liam._id,
        hostLinkedIn: liam.socials?.linkedin || 'https://linkedin.com/in/liamvance',
        thumbnail: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=800&q=80',
        date: getFutureDate(7),
        time: '02:00 PM - 03:30 PM',
        duration: '1.5 Hours',
        meetingLink: 'https://meet.google.com/mno-pqrs-tuv',
        googleFormLink: 'https://forms.gle/dummy-workshop-form',
        showOnHomepage: true,
        status: 'approved'
      }
    ];

    await Workshop.insertMany(workshopsData);
    console.log('Seeded approved workshops.');

    console.log('Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message || error);
    process.exit(1);
  }
};

seedAllDummyData();
