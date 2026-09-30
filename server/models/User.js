const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    employeeId: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    designation: { type: String, trim: true, default: '' },
    joiningDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    avatar: { type: String, default: '' },
    mustChangePassword: { type: Boolean, default: false },
    lastLogin: { type: Date },
    lastLoginInfo: {
      ip: { type: String, default: '' },
      city: { type: String, default: '' },
      region: { type: String, default: '' },
      country: { type: String, default: '' },
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String, default: '' },
      device: { type: String, default: '' },
      browser: { type: String, default: '' },
      os: { type: String, default: '' },
      timestamp: { type: Date },
    },
    loginHistory: [
      {
        ip: { type: String, default: '' },
        city: { type: String, default: '' },
        region: { type: String, default: '' },
        country: { type: String, default: '' },
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String, default: '' },
        device: { type: String, default: '' },
        browser: { type: String, default: '' },
        os: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
