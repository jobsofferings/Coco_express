import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String },
  password: { type: String },
  nickname: { type: String },
});
const User = mongoose.model("user", UserSchema);

export { User }