import Mongoose from "mongoose";
import { config } from "../config.mjs";

export async function connectDB() {
  return Mongoose.connect(config.db.url);
}

export function use_virtual_id(schema) {
  schema.virtual("id").get(function () {
    return this._id.toString();
  });
  schema.set("toJSON", { virtual: true });
  schema.set("toObject", { virtual: true });
}
