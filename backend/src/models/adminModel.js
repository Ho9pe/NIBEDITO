const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name can't be less than 3 characters"],
      maxlength: [30, "Name can't be more than 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    role: {
      type: String,
      enum: ["superadmin", "admin"],
      default: "admin",
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

adminSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    const passwordRegex =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,}$/;
    if (!passwordRegex.test(this.password)) {
      next(
        new Error(
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)"
        )
      );
    }
  }
  next();
});

adminSchema.methods.isSuperAdmin = function () {
  return this.role === "superadmin";
};

// Email index (MOST CRITICAL - used for admin login)
adminSchema.index({ email: 1 }, { unique: true });

// Phone number index (for uniqueness and potential phone-based login)
adminSchema.index({ phone: 1 }, { unique: true });

// Role index (for filtering admins vs superadmins)
adminSchema.index({ role: 1 });

// Last login index (for admin activity tracking)
adminSchema.index({ lastLogin: -1 });

// Compound indexes for admin management queries
adminSchema.index({ role: 1, createdAt: -1 }); // Filter by role + sort by creation date
adminSchema.index({ role: 1, lastLogin: -1 }); // Filter by role + sort by last activity

// Text search for admin search functionality
adminSchema.index(
  {
    name: "text",
    email: "text",
  },
  {
    weights: { email: 10, name: 5 }, // Email matches are more relevant
    name: "admin_search_index",
  }
);

const Admin = model("Admin", adminSchema);
module.exports = Admin;
