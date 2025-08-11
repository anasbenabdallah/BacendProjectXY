import mongoose from "mongoose";

const communSchema = new mongoose.Schema(
  {
    status: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: {},
    },
    type: {
      type: String,
      enum: ["enums", "cars", "drivers", "users"],
      default: "enums",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Shared", communSchema);
