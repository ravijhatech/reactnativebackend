
import fs from 'fs';
import { cloudinary } from '../service/cloudinary.js';
import Blog from '../models/blogUserSchema.js';



export const uploadBlog = async (req, res) => {
 
    try {
        const { blogtitle } = req.body;
        const imageUrl = req.file.path;
        // const url = req.file ? `/uploads/${req.file.filename}` : '';
        const result = await cloudinary.uploader.upload(req.file.path);
        console.log(result);

        fs.unlinkSync(req.file.path);

        const Image = new Blog({
            blogtitle: blogtitle,
            imageUrl: result.secure_url,
            public_id: result.public_id,
        });
        console.log(Image);

        await Image.save();
        res.status(201).json({ message: 'Image uploaded sucessfully!', imageUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const FetchBlog = async (req, res) => {
   try {
    const response = await Blog.find();
    res.json(response);
   } catch (error) {
    res.json({message:"error"})
    
   }

}
export const deleteBlog = async (req, res) => {
    try {
      const blog = await Blog.findByIdAndDelete(req.params.id);

      console.log(blog);
      
      if (!blog) return res.status(404).json({ message: 'Blog not found' });
  
      // Delete image from Cloudinary
      if (blog.public_id) {
        await cloudinary.uploader.destroy(blog.public_id);
      }
  
      // Delete blog from MongoDB
      await blog.deleteOne();
  
      res.status(200).json({ message: 'Blog and image deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };


  export const updateBlog = async (req, res) => {
    try {
      let blog = await Blog.findById(req.params.id);
      console.log(blog);
      
      if (!blog) return res.status(404).json({ message: 'Blog not found' });
  
      const data = {
        title: req.body.blogtitle || blog.blogtitle,
        
      };
      console.log(data);
      // new image is uploaded
      if (req.file) {
        // Delete old image from Cloudinary
        if (blog.public_id) {
          await cloudinary.uploader.destroy(blog.public_id);
        }
  
        // Upload new image
        const result = await cloudinary.uploader.upload(req.file.path);
        data.imageUrl = result.secure_url;
        data.public_id = result.public_id;
      }
      console.log(result);
      
  
      // Update document
      blog = await Blog.findByIdAndUpdate(req.params.id, data, { new: true });
      console.log(blog);
      
  
      res.status(200).json(blog);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };