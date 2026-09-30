/**
 * Quick Add Script - Adds departments + employees without wiping existing data.
 * Run: node seed/quickAdd.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const Task = require('../models/Task');
const { toDateKey } = require('../utils/dateUtils');

const run = async () => {
  await connectDB();

  // ── Add departments (skip if already exist) ──────────────────────────
  console.log('\n📦 Adding departments...');
  const deptList = [
    { name: 'Developer',     description: 'Software development team'       },
    { name: 'Engineering',   description: 'Core engineering team'           },
    { name: 'Design',        description: 'UI/UX and graphic design team'   },
    { name: 'QA',            description: 'Quality assurance & testing'     },
    { name: 'DevOps',        description: 'Infrastructure & deployment'     },
    { name: 'HR',            description: 'Human resources & recruitment'   },
    { name: 'Marketing',     description: 'Marketing, growth & campaigns'   },
    { name: 'Sales',         description: 'Sales & business development'    },
    { name: 'Finance',       description: 'Finance & accounting'            },
    { name: 'Operations',    description: 'Day-to-day operations'           },
    { name: 'Data Science',  description: 'Data analysis & ML team'         },
    { name: 'Support',       description: 'Customer support & success'      },
    { name: 'Product',       description: 'Product management team'         },
    { name: 'Legal',         description: 'Legal & compliance'              },
    { name: 'Security',      description: 'Cybersecurity & infosec'         },
  ];

  let added = 0;
  const deptMap = {};
  for (const d of deptList) {
    let dept = await Department.findOne({ name: d.name });
    if (!dept) {
      dept = await Department.create(d);
      console.log(`  ✅ Created: ${d.name}`);
      added++;
    } else {
      console.log(`  ⏭️  Exists:  ${d.name}`);
    }
    deptMap[d.name] = dept._id;
  }
  console.log(`  → ${added} new departments added\n`);

  // ── Get admin for audit reference ─────────────────────────────────────
  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    console.log('❌ No admin found. Please run the main seed first or create an admin.');
    await mongoose.connection.close();
    process.exit(1);
  }

  // ── Add specific + new employees ──────────────────────────────────────
  console.log('👤 Adding employees...');
  const newEmployees = [
    {
      fullName:    'Bewda Chacha',
      employeeId:  'EMP2001',
      email:       'bewda@company.com',
      phone:       '9876543210',
      department:  deptMap['Developer'],
      designation: 'Senior Developer',
      password:    'Employee@123',
      status:      'active',
    },
    {
      fullName:    'Dev Kumar',
      employeeId:  'EMP2002',
      email:       'devkumar@company.com',
      phone:       '9876543211',
      department:  deptMap['Developer'],
      designation: 'Full Stack Developer',
      password:    'Employee@123',
      status:      'active',
    },
    {
      fullName:    'Raj Tester',
      employeeId:  'EMP2003',
      email:       'raj.tester@company.com',
      phone:       '9876543212',
      department:  deptMap['QA'],
      designation: 'QA Engineer',
      password:    'Employee@123',
      status:      'active',
    },
    {
      fullName:    'Arjun DevOps',
      employeeId:  'EMP2004',
      email:       'arjun.devops@company.com',
      phone:       '9876543213',
      department:  deptMap['DevOps'],
      designation: 'DevOps Engineer',
      password:    'Employee@123',
      status:      'active',
    },
    {
      fullName:    'Sita Data',
      employeeId:  'EMP2005',
      email:       'sita.data@company.com',
      phone:       '9876543214',
      department:  deptMap['Data Science'],
      designation: 'Data Analyst',
      password:    'Employee@123',
      status:      'active',
    },
    {
      fullName:    'Mohan Finance',
      employeeId:  'EMP2006',
      email:       'mohan.finance@company.com',
      phone:       '9876543215',
      department:  deptMap['Finance'],
      designation: 'Finance Manager',
      password:    'Employee@123',
      status:      'active',
    },
    {
      fullName:    'Geeta Product',
      employeeId:  'EMP2007',
      email:       'geeta.product@company.com',
      phone:       '9876543216',
      department:  deptMap['Product'],
      designation: 'Product Manager',
      password:    'Employee@123',
      status:      'active',
    },
    {
      fullName:    'Ravi Support',
      employeeId:  'EMP2008',
      email:       'ravi.support@company.com',
      phone:       '9876543217',
      department:  deptMap['Support'],
      designation: 'Support Engineer',
      password:    'Employee@123',
      status:      'active',
    },
  ];

  const createdEmployees = [];
  for (const e of newEmployees) {
    const exists = await User.findOne({ $or: [{ email: e.email }, { employeeId: e.employeeId }] });
    if (exists) {
      console.log(`  ⏭️  Exists:  ${e.fullName} (${e.employeeId})`);
      createdEmployees.push(exists);
      continue;
    }
    const emp = await User.create({
      ...e,
      role: 'employee',
      joiningDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      mustChangePassword: false,
    });
    console.log(`  ✅ Created: ${e.fullName} — ${e.designation} (${e.department ? 'dept set' : 'no dept'})`);
    createdEmployees.push(emp);
  }

  // ── Add attendance history for new employees (last 14 days) ──────────
  console.log('\n📅 Adding attendance history (14 days)...');
  const taskTitles = [
    'Code Review', 'Bug Fix', 'Feature Development', 'API Integration',
    'Database Optimization', 'Documentation', 'Testing', 'Deployment',
    'Client Meeting', 'Sprint Planning', 'Design Review', 'Security Audit',
  ];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  const statuses   = ['pending', 'in_progress', 'completed'];

  for (const emp of createdEmployees) {
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const day = d.getDay();
      if (day === 0 || day === 6) continue; // skip weekends

      const exists = await Attendance.findOne({ employee: emp._id, date: toDateKey(d) });
      if (exists) continue;

      const rand = Math.random();
      if (rand < 0.08) continue; // 8% absent

      const startHour   = 9 + Math.floor(Math.random() * 2);
      const startMinute = Math.floor(Math.random() * 59);
      const startTime   = new Date(d);
      startTime.setHours(startHour, startMinute, 0, 0);

      const workedHours       = 6 + Math.random() * 2.5;
      const totalWorkingSeconds = Math.floor(workedHours * 3600);
      const totalBreakSeconds   = Math.floor((20 + Math.random() * 40) * 60);

      const isToday = i === 0;
      let endTime = null;
      let status  = 'completed';
      let currentState = 'stopped';

      if (isToday && Math.random() < 0.5) {
        status       = 'working';
        currentState = Math.random() < 0.75 ? 'working' : 'on_break';
      } else {
        endTime = new Date(startTime.getTime() + (totalWorkingSeconds + totalBreakSeconds) * 1000);
      }

      await Attendance.create({
        employee: emp._id,
        date: toDateKey(d),
        startTime,
        endTime,
        totalWorkingSeconds,
        totalBreakSeconds,
        status,
        currentState,
        isLate: startHour >= 10,
      });
    }

    // Add tasks
    for (let t = 0; t < 4; t++) {
      const d = new Date();
      d.setDate(d.getDate() - Math.floor(Math.random() * 10));
      const taskStatus = statuses[Math.floor(Math.random() * statuses.length)];
      await Task.create({
        title: taskTitles[Math.floor(Math.random() * taskTitles.length)],
        description: 'Auto-generated task for demo purposes.',
        taskDate: toDateKey(d),
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        status: taskStatus,
        estimatedTimeMinutes: 60 + Math.floor(Math.random() * 180),
        actualTimeMinutes: taskStatus === 'completed' ? 60 + Math.floor(Math.random() * 180) : 0,
        department: emp.department,
        assignedTo: emp._id,
        createdBy: admin._id,
        completedAt: taskStatus === 'completed' ? new Date() : null,
      });
    }
  }

  console.log('\n✅ Quick add complete!\n');
  console.log('─────────────────────────────────────────');
  console.log('New Employee Logins:');
  console.log('  Bewda Chacha    → bewda@company.com      / Employee@123');
  console.log('  Dev Kumar       → devkumar@company.com   / Employee@123');
  console.log('  Raj Tester      → raj.tester@company.com / Employee@123');
  console.log('  Arjun DevOps    → arjun.devops@company.com / Employee@123');
  console.log('─────────────────────────────────────────\n');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
