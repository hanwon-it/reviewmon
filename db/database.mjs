import Mongoose from "mongoose";
import { config } from "../config.mjs";

export async function connetDB() {
  return Mongoose.connect(config.db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

export function use_virtual_id(schema) {
  schema.virtual("id").get(function () {
    return this._id.toString();
  });
  schema.set("toJSON", { virtual: true });
  schema.set("toObject", { virtual: true });
}
