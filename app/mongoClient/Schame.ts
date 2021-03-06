import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const articleSchema = new Schema({
  title: { type: String },
  summary: { type: String },
  author: { type: String },
  timer: { type: String },
  headImgSrc: { type: String },
  id: { type: String },
  briefContent: { type: String },
  like: { type: Number },
  read: { type: Number },
});
const Article = mongoose.model("article", articleSchema);

const FriendLinkSchema = new Schema({
  name: { type: String },
  timer: { type: String },
  link: { type: String },
  icon: { type: String },
  description: { type: String },
});
const FriendLink = mongoose.model("friendlink", FriendLinkSchema);

const MessageSchema = new Schema({
  messageContent: { type: String },
  ip: { type: String },
  time: { type: String },
}); 
const Messages = mongoose.model("message", MessageSchema);

export { Article, FriendLink, Messages }