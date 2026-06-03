import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    studentId: String,
    department: String,
    interests: [String],
    favoriteGenres: [String],
    favoriteAuthors: [String],
    isActive: { type: Boolean, default: true },
    loginCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
