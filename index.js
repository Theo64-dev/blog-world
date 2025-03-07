import express from "express";
import fs from "fs/promises";
import bodyParser from "body-parser";
import path from "path";
import { marked } from "marked";

const app = express();
const port = 3000;
const blogsFilePath = path.join(process.cwd(), "blogs.json");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


async function readBlogsFromFile() {
  try {
    const data = await fs.readFile(blogsFilePath, "utf-8");
    return data ? JSON.parse(data) : [];
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    console.error("Error reading blogs file:", err);
    throw err;
  }
}


async function writeBlogsToFile(blogs) {
  try {
    await fs.writeFile(blogsFilePath, JSON.stringify(blogs, null, 2));
  } catch (err) {
    console.error("Error writing blogs file:", err);
    throw err;
  }
}


app.get("/", async (req, res) => {
  try {
    const blogs = await readBlogsFromFile();
    res.render("index.ejs", { blog_arr: blogs });
  } catch (err) {
    res.status(500).send("Error loading blogs");
  }
});


app.get("/write", (req, res) => {
  res.render("write.ejs", { blog: { title: "", content: "" }, isNew: true });
});


app.get("/edit", async (req, res) => {
  try {
    const blogs = await readBlogsFromFile();
    const blogIndex = parseInt(req.query.id);
    
    if (isNaN(blogIndex) || blogIndex < 0 || blogIndex >= blogs.length) {
      return res.redirect('/');
    }
    
    const blog = blogs[blogIndex];
    res.render("write.ejs", { blog, isNew: false, blogId: blogIndex });
  } catch (err) {
    res.status(500).send("Error loading blog for editing");
  }
});


app.get('/blog', async (req, res) => {
  try {
    const blogs = await readBlogsFromFile();
    const blogIndex = parseInt(req.query.id);
    
    if (isNaN(blogIndex) || blogIndex < 0 || blogIndex >= blogs.length) {
      return res.redirect('/');
    }
    
    const currentBlog = blogs[blogIndex];
    const formattedContent = marked(currentBlog.content);
    
    res.render("viewblog.ejs", {
      title: currentBlog.title,
      content: formattedContent,
      rawContent: currentBlog.content
    });
  } catch (err) {
    res.status(500).send("Error loading blog");
  }
});


app.post("/post", async (req, res) => {
  try {
    const blogs = await readBlogsFromFile();
    blogs.push({
      title: req.body.title,
      content: req.body.content,
      createdAt: new Date().toISOString()
    });
    
    await writeBlogsToFile(blogs);
    res.redirect('/');
  } catch (err) {
    res.status(500).send("Error saving blog");
  }
});


app.post("/update", async (req, res) => {
  try {
    const blogs = await readBlogsFromFile();
    const blogIndex = parseInt(req.body.blogId);
    
    if (isNaN(blogIndex) || blogIndex < 0 || blogIndex >= blogs.length) {
      return res.redirect('/');
    }
    
    blogs[blogIndex] = {
      ...blogs[blogIndex],
      title: req.body.title,
      content: req.body.content,
      updatedAt: new Date().toISOString()
    };
    
    await writeBlogsToFile(blogs);
    res.redirect('/');
  } catch (err) {
    res.status(500).send("Error updating blog");
  }
});


app.delete("/delete", async (req, res) => {
  try {
    const blogs = await readBlogsFromFile();
    const blogIndex = parseInt(req.query.id);
    
    if (isNaN(blogIndex) || blogIndex < 0 || blogIndex >= blogs.length) {
      return res.status(400).send("Invalid blog index");
    }
    
    blogs.splice(blogIndex, 1);
    await writeBlogsToFile(blogs);
    
    res.sendStatus(200);
  } catch (err) {
    console.error("Error deleting blog:", err);
    res.status(500).send("Error deleting blog");
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});