import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  imageUrl: String,
  blogtitle: String,
  public_id: String,
},
{timestamps:true});

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
