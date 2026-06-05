import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from '../models/User.model.js';
import Admin from '../models/Admin.model.js';
import Idea from '../models/Idea.model.js';
import IdeaComment from '../models/IdeaComment.model.js';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/innovative-hub';

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  // Clean old ideas & comments
  await Idea.deleteMany({});
  await IdeaComment.deleteMany({});
  console.log('Cleaned existing ideas and comments.');

  // Find or create dummy users
  let student = await User.findOne({ email: 'student@example.com' });
  if (!student) {
    student = await User.create({
      name: 'Rohan Sharma',
      email: 'student@example.com',
      password: 'password123',
      role: 'student',
      bio: 'Robotics enthusiast and B.Tech student exploring embedded systems and control design.',
      expertise: ['Arduino', 'PCB Design', '3D Printing'],
      education: {
        college: 'Odisha Institute of Technology',
        graduationYear: 2027,
        course: 'B.Tech in Electronics'
      },
      profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80'
    });
    console.log('Created student: Rohan Sharma');
  }

  let tutor = await User.findOne({ email: 'tutor@example.com' });
  if (!tutor) {
    tutor = await User.create({
      name: 'Dr. Anita Mohanty',
      email: 'tutor@example.com',
      password: 'password123',
      role: 'tutor',
      tutorStatus: 'approved',
      bio: 'IoT Researcher and Consultant. 8+ years experience guiding students in electronics prototyping.',
      expertise: ['IoT', 'ESP32', 'Raspberry Pi', 'Embedded C'],
      education: {
        college: 'State Technical University',
        graduationYear: 2015,
        course: 'Ph.D. in Embedded Systems'
      },
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80'
    });
    console.log('Created tutor: Dr. Anita Mohanty');
  }

  const admin = await Admin.findOne({});
  const adminId = admin ? admin._id : new mongoose.Types.ObjectId();

  // 1. Seed Community Posts
  const communityPosts = [
    {
      userId: student._id,
      type: 'community',
      category: 'Robotics',
      description: 'Just finished assembling my first line-following robot chassis! The differential drive motor response is extremely smooth. Planning to implement PID control next week to make it navigate sharp corners.',
      photos: [
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&h=400&q=80',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&h=400&q=80'
      ],
      upvotes: [tutor._id.toString()],
      downvotes: [],
      commentsCount: 2
    },
    {
      userId: tutor._id,
      type: 'community',
      category: 'IoT',
      description: 'Pro Tip: When deploying ESP32 nodes outdoors, make sure to enable Deep Sleep mode to conserve battery. Readings taken every 15 minutes can extend the life of a standard 18650 cell from 2 days to over 6 months!',
      photos: [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&h=400&q=80'
      ],
      upvotes: [student._id.toString()],
      downvotes: [],
      commentsCount: 1
    },
    {
      adminId: adminId,
      type: 'community',
      category: 'Other',
      description: 'Welcome to the Ideas & Resource Hub! This is a dedicated workspace for all students and makers to share design concepts, upload schematics, and collaborate. Admin moderation is enabled to keep the hub constructive.',
      photos: [],
      upvotes: [student._id.toString(), tutor._id.toString()],
      downvotes: [],
      commentsCount: 0
    }
  ];

  const seededCommunity = await Idea.create(communityPosts);
  console.log('Seeded 3 community posts.');

  // 2. Seed Structured Ideas
  const structuredIdeas = [
    {
      userId: tutor._id,
      type: 'structured',
      title: 'Automated Hydroponics Greenhouse System',
      category: 'IoT',
      description: 'An automated IoT monitoring and controller node that manages light, nutrient circulation, and water levels in a vertical greenhouse system.',
      problemStatement: 'Greenhouse farming requires regular manual testing of water pH, EC (electrical conductivity), and temperature, which is time-consuming and vulnerable to human oversight.',
      solution: 'An ESP32 MCU reads analog pH and EC values, sending telemetry over MQTT to a centralized server. Solenoid valves are automatically activated via relays to adjust nutrient solutions and run peristaltic pumps when pH deviates from 6.0.',
      techStack: ['ESP32', 'MQTT', 'Peristaltic Pumps', 'React', 'Node.js', 'MongoDB'],
      links: ['github.com/innovative-hub/hydroponics-iot', 'schematics.io/hydro-controller'],
      photos: [
        'https://images.unsplash.com/photo-1603732551658-5fabb9a521b1?auto=format&fit=crop&w=600&h=400&q=80'
      ],
      files: [
        {
          name: 'Hydroponics_Schematics_v1.pdf',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        }
      ],
      upvotes: [student._id.toString()],
      downvotes: [],
      commentsCount: 1
    },
    {
      userId: student._id,
      type: 'structured',
      title: 'LiDAR-guided Autonomous SLAM Mapping Rover',
      category: 'Robotics',
      description: 'A 4-wheel drive robotics rover implementing Gmapping SLAM and navigation stacks using a 2D LiDAR and a Raspberry Pi computer.',
      problemStatement: 'Mapping hazardous areas (like collapsed mines or structurally unsafe warehouses) manually poses major safety risks to human surveyors.',
      solution: 'A mobile base utilizing an RPLIDAR A1 sensor collects point-cloud scans. A Raspberry Pi 4 running ROS (Robot Operating System) computes map generation and localization, enabling the rover to plan autonomous navigation paths around obstacles.',
      techStack: ['ROS Noetic', 'Raspberry Pi 4', 'RPLIDAR A1', 'SLAM', 'LiDAR', 'Python'],
      links: ['github.com/innovative-hub/slam-rover-ros'],
      photos: [
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&h=400&q=80'
      ],
      files: [
        {
          name: 'SLAM_Rover_Presentation.pptx',
          url: 'https://scholar.harvard.edu/files/trenton/files/sample_presentation.pptx'
        }
      ],
      upvotes: [tutor._id.toString()],
      downvotes: [],
      commentsCount: 0
    }
  ];

  const seededStructured = await Idea.create(structuredIdeas);
  console.log('Seeded 2 structured ideas.');

  // 3. Seed Comments
  const comments = [
    {
      ideaId: seededCommunity[0]._id, // Rohan's line follower
      userId: tutor._id,
      comment: 'Excellent work Rohan! Consider adding an encoder on the wheels. It will help with PID calculations by measuring actual velocity rather than relying on raw PWM output.'
    },
    {
      ideaId: seededCommunity[0]._id,
      userId: student._id,
      comment: 'Thanks Dr. Anita! I actually ordered two optical encoders from the E-Shop yesterday. Will update my code once they arrive.'
    },
    {
      ideaId: seededCommunity[1]._id, // Anita's ESP32 tip
      userId: student._id,
      comment: 'This is a lifesaver. I was getting constant brownout loops and thought my ESP32 board was damaged. Added a 10uF capacitor and it works perfectly now!'
    },
    {
      ideaId: seededStructured[0]._id, // Hydroponics Structured Idea
      userId: student._id,
      comment: 'Is the EC sensor calibration code included in the GitHub repository? I would love to build this for my final year project.'
    }
  ];

  await IdeaComment.create(comments);
  console.log('Seeded 4 comments.');

  console.log('Seeding completed successfully!');
  process.exit(0);
}

run().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
