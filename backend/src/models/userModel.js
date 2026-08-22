const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");
const {
  PASSWORD_MIN_LENGTH,
  PASSWORD_PATTERN,
  PASSWORD_LENGTH_MESSAGE,
  PASSWORD_MESSAGE,
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MESSAGE,
  PHONE_PATTERN,
} = require("../constants/validationRules");

const { defaultPicture } = require("../secret");

const addressSchema = new Schema(
  {
    street: {
      type: String,
      required: [true, "Street address is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    postalCode: {
      type: String,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [NAME_MIN_LENGTH, NAME_MESSAGE],
      maxlength: [NAME_MAX_LENGTH, NAME_MESSAGE],
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
      minlength: [PASSWORD_MIN_LENGTH, PASSWORD_LENGTH_MESSAGE],
      validate: {
        validator: function (v) {
          return PASSWORD_PATTERN.test(v);
        },
        message: () => PASSWORD_MESSAGE,
      },
    },
    profilePicture: {
      type: String,
      default: defaultPicture,
    },
    addresses: {
      type: [addressSchema],
      validate: [
        {
          validator: function (addresses) {
            return addresses.length <= 5;
          },
          message: "You can only have up to 5 addresses",
        },
        {
          validator: function (addresses) {
            // Check if only one address is marked as default
            return addresses.filter((addr) => addr.isDefault).length <= 1;
          },
          message: "Only one address can be set as default",
        },
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      validate: {
        validator: function (v) {
          return PHONE_PATTERN.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },

    wishlist: {
      type: [Schema.Types.ObjectId],
      ref: "Product",
      default: [],
    },

    isBanned: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      email: { type: Boolean, default: false },
      phone: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Add the same password hashing pre-save hook as before
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Email index (used for login and uniqueness)
userSchema.index({ email: 1 }, { unique: true });

// Phone number index (for phone-based login and verification)
userSchema.index({ phone: 1 }, { unique: true });

// Verification status indexes (for admin filtering)
userSchema.index({ "verificationStatus.email": 1 });
userSchema.index({ "verificationStatus.phone": 1 });

// Ban status index (for filtering active/banned users)
userSchema.index({ isBanned: 1 });

// Wishlist optimization (for product recommendations)
userSchema.index({ wishlist: 1 });

// Address default lookup optimization
userSchema.index({ "addresses.isDefault": 1 });

// Compound indexes for admin queries
userSchema.index({ isBanned: 1, createdAt: -1 }); // Admin: filter by ban status + sort by date
userSchema.index({ "verificationStatus.email": 1, createdAt: -1 }); // Admin: unverified users by date

// Text search for admin user search
userSchema.index(
  {
    name: "text",
    email: "text",
  },
  {
    weights: { email: 10, name: 5 }, // Email matches are more relevant
    name: "user_search_index",
  }
);

// Login optimization (email OR phone login)
userSchema.index({ email: 1, phone: 1 }); // Compound for dual login support

const User = model("User", userSchema);
module.exports = User;
