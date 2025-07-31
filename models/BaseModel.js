export const baseSchemaFields = {
  status: {
    type: String,
    enum: ["active", "inactive", "suspended"],
    default: "active",
  },
};
