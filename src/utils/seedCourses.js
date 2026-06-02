import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.model.js';
import Course from '../models/Course.model.js';
import CourseEnrollment from '../models/CourseEnrollment.model.js';
import SessionSlot from '../models/SessionSlot.model.js';
import Workshop from '../models/Workshop.model.js';
import Internship from '../models/Internship.model.js';

dotenv.config();

const seedCoursesAndSessions = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Cleaning up existing courses, enrollments, slots, and seeded tutors...');
    
    // Clear courses, enrollments, slots, workshops, internships
    await Course.deleteMany({});
    await CourseEnrollment.deleteMany({});
    await SessionSlot.deleteMany({});
    await Workshop.deleteMany({});
    await Internship.deleteMany({});

    // Delete existing seed tutors
    const seedEmails = ['croft@innovativehub.com', 'aisha@innovativehub.com', 'liam@innovativehub.com'];
    await User.deleteMany({ email: { $in: seedEmails } });

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
      }
    ];

    // Create users. This will trigger password hashing in the User model pre-save hook.
    const createdTutors = [];
    for (const tData of tutorsData) {
      const tutor = new User(tData);
      await tutor.save();
      createdTutors.push(tutor);
      console.log(`Created tutor: ${tutor.name}`);
    }

    const [croft, aisha, liam] = createdTutors;

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
          {
            title: 'Introduction to ROS2 Architecture',
            description: 'Learn the core design principles of ROS2 compared to ROS1, DDS middleware, and installation tips.',
            videoUrl: 'https://www.youtube.com/watch?v=999o8W6j558',
            attachmentUrl: 'https://github.com/ros2/ros2/wiki'
          },
          {
            title: 'Understanding Nodes and Executables',
            description: 'Write your first Python node and execute it using colcon build tooling.',
            videoUrl: 'https://www.youtube.com/watch?v=999o8W6j558',
            attachmentUrl: 'https://github.com/ros2/ros2/wiki'
          },
          {
            title: 'Topics and Publisher/Subscriber Pattern',
            description: 'Communicate between nodes using standard messages and custom topics.',
            videoUrl: 'https://www.youtube.com/watch?v=999o8W6j558',
            attachmentUrl: 'https://github.com/ros2/ros2/wiki'
          },
          {
            title: 'ROS2 Services vs Actions',
            description: 'Understand request-response parameters and long-running feedback tasks with action servers.',
            videoUrl: 'https://www.youtube.com/watch?v=999o8W6j558',
            attachmentUrl: 'https://github.com/ros2/ros2/wiki'
          }
        ]
      },
      {
        tutorId: aisha._id,
        title: 'ESP32 IoT Nodes: Industrial Sensor Networks',
        description: 'Learn to build robust, low-power IoT sensor nodes using the ESP32 microcontroller, FreeRTOS, and MQTT. Stream sensor readings to a custom dashboard and control actuators remotely.',
        difficulty: 'intermediate',
        topic: 'IoT',
        price: 999,
        thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
        isPublished: true,
        lectures: [
          {
            title: 'Setting up ESP-IDF and Toolchain',
            description: 'Initialize the Espressif IoT Development Framework and flashing tool setup.',
            videoUrl: 'https://www.youtube.com/watch?v=999o8W6j558',
            attachmentUrl: 'https://docs.espressif.com/projects/esp-idf/en/latest/esp32/'
          },
          {
            title: 'GPIO Interrupts and ADC Reading',
            description: 'Connect physical analog sensors and configure hardware interrupts safely.',
            videoUrl: 'https://www.youtube.com/watch?v=999o8W6j558',
            attachmentUrl: 'https://docs.espressif.com/projects/esp-idf/en/latest/esp32/'
          },
          {
            title: 'FreeRTOS Tasks and Queues',
            description: 'Design multi-threaded micro-controller applications with cooperative scheduling.',
            videoUrl: 'https://www.youtube.com/watch?v=999o8W6j558',
            attachmentUrl: 'https://docs.espressif.com/projects/esp-idf/en/latest/esp32/'
          },
          {
            title: 'MQTT Protocol and Web Dashboard Stream',
            description: 'Publish telemetry data to public brokers and handle remote commands.',
            videoUrl: 'https://www.youtube.com/watch?v=999o8W6j558',
            attachmentUrl: 'https://docs.espressif.com/projects/esp-idf/en/latest/esp32/'
          }
        ]
      },
      {
        tutorId: liam._id,
        title: 'Arduino Firmware: Writing Clean Register Drivers',
        description: 'Go beyond standard library wrappers. Learn register-level programming, hardware timer configurations, interrupts, and serial protocol drivers on Arduino boards.',
        difficulty: 'advanced',
        topic: 'Arduino',
        price: 0, // Free course
        thumbnailUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=800&q=80',
        isPublished: true,
        lectures: [
          {
            title: 'AVR Register Level Access',
            description: 'Bypass digitalWrite and toggle pins directly via DDR and PORT registers.',
            videoUrl: 'https://www.youtube.com/watch?v=999o8W6j558',
            attachmentUrl: 'https://www.arduino.cc/en/Reference/HomePage'
          },
          {
            title: 'Hardware Timers and PWM Signal Generation',
            description: 'Configure Timer1 to output custom high-frequency PWM pulses.',
            videoUrl: 'https://www.youtube.com/watch?v=999o8W6j558',
            attachmentUrl: 'https://www.arduino.cc/en/Reference/HomePage'
          },
          {
            title: 'I2C and SPI Protocol Implementation',
            description: 'Write customized drivers for basic IMUs and display modules.',
            videoUrl: 'https://www.youtube.com/watch?v=999o8W6j558',
            attachmentUrl: 'https://www.arduino.cc/en/Reference/HomePage'
          },
          {
            title: 'Interrupt Service Routines (ISR) Rules',
            description: 'Write lightweight, fast interrupt handlers without bloating execution threads.',
            videoUrl: 'https://www.youtube.com/watch?v=999o8W6j558',
            attachmentUrl: 'https://www.arduino.cc/en/Reference/HomePage'
          }
        ]
      }
    ];

    for (const cData of coursesData) {
      const course = await Course.create(cData);
      console.log(`Created course: ${course.title}`);
    }

    console.log('Seeding available tutoring slots...');

    // Generate dates for slots (e.g., tomorrow and following days)
    const getFutureDate = (daysAhead) => {
      const date = new Date();
      date.setDate(date.getDate() + daysAhead);
      date.setHours(0, 0, 0, 0);
      return date;
    };

    const slotsData = [
      // Slots for Ryan Croft
      {
        tutorId: croft._id,
        date: getFutureDate(1),
        time: '10:00 AM - 11:00 AM',
        topic: 'ROS',
        cost: 499,
        status: 'available'
      },
      {
        tutorId: croft._id,
        date: getFutureDate(1),
        time: '02:00 PM - 03:00 PM',
        topic: 'ROS',
        cost: 499,
        status: 'available'
      },
      {
        tutorId: croft._id,
        date: getFutureDate(2),
        time: '11:00 AM - 12:00 PM',
        topic: 'ROS2',
        cost: 0, // Free slot
        status: 'available'
      },
      
      // Slots for Aisha Sharma
      {
        tutorId: aisha._id,
        date: getFutureDate(1),
        time: '09:00 AM - 10:00 AM',
        topic: 'IoT',
        cost: 399,
        status: 'available'
      },
      {
        tutorId: aisha._id,
        date: getFutureDate(2),
        time: '04:00 PM - 05:00 PM',
        topic: 'ESP32',
        cost: 399,
        status: 'available'
      },
      {
        tutorId: aisha._id,
        date: getFutureDate(3),
        time: '10:00 AM - 11:00 AM',
        topic: 'IoT',
        cost: 0,
        status: 'available'
      },

      // Slots for Liam Vance
      {
        tutorId: liam._id,
        date: getFutureDate(1),
        time: '11:00 AM - 12:00 PM',
        topic: 'Arduino',
        cost: 299,
        status: 'available'
      },
      {
        tutorId: liam._id,
        date: getFutureDate(2),
        time: '03:00 PM - 04:00 PM',
        topic: 'Control Systems',
        cost: 299,
        status: 'available'
      },
      {
        tutorId: liam._id,
        date: getFutureDate(3),
        time: '01:00 PM - 02:00 PM',
        topic: 'Arduino',
        cost: 299,
        status: 'available'
      },
      {
        tutorId: liam._id,
        date: getFutureDate(4),
        time: '02:00 PM - 03:00 PM',
        topic: 'Control Systems',
        cost: 0,
        status: 'available'
      }
    ];

    await SessionSlot.insertMany(slotsData);
    console.log('Seeded 10 available session slots.');

    console.log('Seeding workshops...');
    const workshopsData = [
      {
        title: 'Introduction to Autonomous Mobile Robots (AMR)',
        description: 'Join us for a hands-on introduction to AMR concepts, path planning algorithms, and chassis assembly. Perfect for robotics students.',
        hostName: croft.name,
        hostEmail: croft.email,
        hostId: croft._id,
        date: getFutureDate(2),
        time: '11:00 AM - 01:00 PM',
        duration: '2 hours',
        meetingLink: 'https://meet.google.com/ros-amr-demo',
        googleFormLink: 'https://forms.gle/dummy-workshop-form',
        showOnHomepage: true,
        status: 'approved'
      },
      {
        title: 'Building Smart Agriculture IoT Nodes with ESP32',
        description: 'Learn register level configuration and battery sleep mode optimization of ESP32 micro-controllers in solar-powered telemetry nodes.',
        hostName: aisha.name,
        hostEmail: aisha.email,
        hostId: aisha._id,
        date: getFutureDate(4),
        time: '03:00 PM - 04:30 PM',
        duration: '1.5 hours',
        meetingLink: 'https://meet.google.com/esp32-agri-demo',
        googleFormLink: 'https://forms.gle/dummy-workshop-form',
        showOnHomepage: true,
        status: 'approved'
      }
    ];
    await Workshop.insertMany(workshopsData);
    console.log('Seeded 2 workshops (1 approved, 1 pending).');

    console.log('Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message || error);
    process.exit(1);
  }
};

seedCoursesAndSessions();
