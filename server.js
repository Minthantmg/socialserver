
const mongoose = require("mongoose");
const express = require("express");
const dbURI = "mongodb+srv://kei94:kei94@cluster0.w6setwz.mongodb.net/test?retryWrites=true&w=majority";
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require("nodemailer");
const app = express()
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(cors())

const emailUsername = 'minthant180@gmail.com';
const emailPassword = 'taea ndwl anfv uddj';
const redirectUrl = 'http://localhost:3000/auth/email-success';

const port = 8002;
mongoose
    .connect(dbURI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB", err);
    });

const userSchema = new mongoose.Schema({
    name : String,
    email : String,
    password : String,
    verified : Boolean,
});

const postSchema = new mongoose.Schema({
    title : String,
});

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);

const sendVerificationEmail = async (email) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com', // Replace with your email provider's SMTP host
            port: 587,
            secure: false, // Use `true` for TLS, `false` for STARTTLS
            auth: {
                user: emailUsername,
                pass: emailPassword,
            },
        });

        const mailOptions = {
            from: 'no-reply@your-website.com', // Your sender email address
            to: email,
            subject: 'Verify Your Account',
            text: `Click here to verify your account: ${redirectUrl}`,
        };

        await transporter.sendMail(mailOptions);
        console.log('Verification email sent to:', email);
    } catch (error) {
        console.error('Error sending verification email:', error);
    }
};
app.post('/posts', async (req, res) => {
    try {
        const postData = req.body;
        const newPost = new Post(postData);
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create post' });
    }
});

app.post('/users', async (req, res) => {
    try {
        const userData = req.body;
        console.log("USER DATA",userData)
        const newUser = new User(userData);
        await newUser.save();
        await sendVerificationEmail(newUser.email);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});

app.get("/users", async (req, res) => {
    try {
        const users = await User.find();
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Error retrieving users" });
    }
});

app.put("/users/:userEmail", async (req, res) => {
    const userEmail = req.params.userEmail;
    const updateData = req.body;
    try {
        const updatedPost = await Post.findByIdAndUpdate({ _id: userEmail }, updateData, { new: true });
        if (!updatedPost) {
            return res.status(404).json({ error: "Post not found" });
        }
        res.send({message:"get specific user success",updatedPost})
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ error: "Error updating post" });
    }
});
app.listen(port,()=>{
    console.log(`server is running in port ${port}`)
})