/**
 * Seed script - populates demo data for local development/testing.
 * Run with: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const Task = require('../models/Task');
const Leave = require('../models/Leave');
const Holiday = require('../models/Holiday');
const Settings = require('../models/Settings');
const { toDateKey } = require('../utils/dateUtils');

const run = async () => {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Attendance.deleteMany({}),
    Task.deleteMany({}),
    Leave.deleteMany({}),
    Holiday.deleteMany({}),
    Settings.deleteMany({}),
  ]);

  console.log('Creating departments...');
  const departments = await Department.insertMany([
    { name: 'Engineering', description: 'Software development team' },
    { name: 'Design', description: 'UI/UX design team' },
    { name: 'Sales', description: 'Sales and business development' },
    { name: 'HR', description: 'Human resources' },
    { name: 'Marketing', description: 'Marketing and growth' },
  ]);
  const [eng, design, sales, hr, marketing] = departments;

  console.log('Creating settings...');
  await Settings.create({ key: 'global', companyName: 'Nexora Technologies' });

  console.log('Creating admin...');
  const admin = await User.create({
    fullName: 'System Administrator',
    employeeId: 'ADM0001',
    email: 'admin@company.com',
    phone: '9999999999',
    password: 'Admin@123',
    role: 'admin',
    designation: 'Administrator',
    status: 'active',
  });

  console.log('Creating employees...');
  const empData = [
    { fullName: 'Rahul Sharma', employeeId: 'EMP1001', email: 'rahul@company.com', department: eng._id, designation: 'Senior Developer', status: 'active' },
    { fullName: 'Priya Patel', employeeId: 'EMP1002', email: 'priya@company.com', department: design._id, designation: 'UI/UX Designer', status: 'active' },
    { fullName: 'Amit Kumar', employeeId: 'EMP1003', email: 'amit@company.com', department: eng._id, designation: 'Backend Developer', status: 'active' },
    { fullName: 'Sneha Reddy', employeeId: 'EMP1004', email: 'sneha@company.com', department: sales._id, designation: 'Sales Executive', status: 'active' },
    { fullName: 'Vikram Singh', employeeId: 'EMP1005', email: 'vikram@company.com', department: hr._id, designation: 'HR Manager', status: 'active' },
    { fullName: 'Anjali Gupta', employeeId: 'EMP1006', email: 'anjali@company.com', department: marketing._id, designation: 'Marketing Specialist', status: 'active' },
    { fullName: 'Karan Mehta', employeeId: 'EMP1007', email: 'karan@company.com', department: eng._id, designation: 'Frontend Developer', status: 'inactive' },
    { fullName: 'Neha Joshi', employeeId: 'EMP1008', email: 'neha@company.com', department: design._id, designation: 'Graphic Designer', status: 'active' },
  ];

  const employees = [];
  for (const e of empData) {
    const emp = await User.create({
      ...e,
      phone: '90000' + Math.floor(10000 + Math.random() * 89999),
      password: 'Employee@123',
      role: 'employee',
      joiningDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    });
    employees.push(emp);
  }

  console.log('Creating attendance records (last 14 days)...');
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = toDateKey(d);
    const day = d.getDay();
    if (day === 0 || day === 6) continue; // skip weekends

    for (const emp of employees) {
      if (emp.status === 'inactive') continue;
      const rand = Math.random();
      if (rand < 0.08) continue; // absent

      const startHour = 9 + Math.floor(Math.random() * 1.5);
      const startMinute = Math.floor(Math.random() * 59);
      const startTime = new Date(d);
      startTime.setHours(startHour, startMinute, 0, 0);

      const workedHours = 6 + Math.random() * 2.5;
      const totalWorkingSeconds = Math.floor(workedHours * 3600);
      const totalBreakSeconds = Math.floor((30 + Math.random() * 30) * 60);

      const isToday = i === 0;
      let endTime = null;
      let status = 'completed';
      let currentState = 'stopped';

      if (isToday && Math.random() < 0.4) {
        status = 'working';
        currentState = Math.random() < 0.8 ? 'working' : 'on_break';
      } else {
        endTime = new Date(startTime.getTime() + totalWorkingSeconds * 1000 + totalBreakSeconds * 1000);
      }

      await Attendance.create({
        employee: emp._id,
        date: dateKey,
        startTime,
        endTime,
        totalWorkingSeconds,
        totalBreakSeconds,
        status,
        currentState,
        isLate: startHour >= 10,
      });
    }
  }

  console.log('Creating tasks...');
  const taskTitles = [
    'Develop Employee Dashboard', 'Fix Login Bug', 'Design Landing Page',
    'API Integration', 'Database Optimization', 'Client Follow-up Call',
    'Prepare Monthly Report', 'Update Documentation', 'Code Review',
    'Testing & QA', 'Social Media Campaign', 'Onboard New Hire',
  ];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  const statuses = ['pending', 'in_progress', 'completed'];

  for (const emp of employees.filter((e) => e.status === 'active')) {
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() - Math.floor(Math.random() * 7));
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      await Task.create({
        title: taskTitles[Math.floor(Math.random() * taskTitles.length)],
        description: 'Task details and requirements go here.',
        taskDate: toDateKey(d),
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        status,
        estimatedTimeMinutes: 60 + Math.floor(Math.random() * 180),
        actualTimeMinutes: status === 'completed' ? 60 + Math.floor(Math.random() * 180) : Math.floor(Math.random() * 60),
        department: emp.department,
        assignedTo: emp._id,
        createdBy: Math.random() < 0.5 ? admin._id : emp._id,
        completedAt: status === 'completed' ? new Date() : null,
      });
    }
  }

  console.log('Creating leave requests...');
  const leaveTypes = ['casual', 'sick', 'earned', 'wfh', 'other'];
  for (const emp of employees.filter((e) => e.status === 'active').slice(0, 5)) {
    const start = new Date();
    start.setDate(start.getDate() + Math.floor(Math.random() * 10));
    const end = new Date(start);
    end.setDate(end.getDate() + Math.floor(Math.random() * 3));
    await Leave.create({
      employee: emp._id,
      leaveType: leaveTypes[Math.floor(Math.random() * leaveTypes.length)],
      startDate: toDateKey(start),
      endDate: toDateKey(end),
      days: Math.floor((end - start) / 86400000) + 1,
      reason: 'Personal reasons',
      status: 'pending',
    });
  }

  console.log('Creating holidays...');
  const year = new Date().getFullYear();
  await Holiday.insertMany([
    { name: "New Year's Day", date: `${year}-01-01`, type: 'mandatory', description: 'New Year celebration' },
    { name: 'Republic Day', date: `${year}-01-26`, type: 'mandatory', description: 'National holiday' },
    { name: 'Holi', date: `${year}-03-14`, type: 'optional', description: 'Festival of colors' },
    { name: 'Independence Day', date: `${year}-08-15`, type: 'mandatory', description: 'National holiday' },
    { name: 'Gandhi Jayanti', date: `${year}-10-02`, type: 'mandatory', description: 'National holiday' },
    { name: 'Diwali', date: `${year}-11-01`, type: 'mandatory', description: 'Festival of lights' },
    { name: 'Christmas', date: `${year}-12-25`, type: 'optional', description: 'Christmas celebration' },
  ]);

  console.log('\n✅ Seed data created successfully!\n');
  console.log('Admin login: admin@company.com / Admin@123');
  console.log('Employee login (e.g.): rahul@company.com / Employee@123');
  console.log('Inactive employee (blocked login): karan@company.com / Employee@123\n');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
