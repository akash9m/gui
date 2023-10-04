import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import encrypt from "mongoose-encryption"

const app = express();
mongoose.connect("mongodb+srv://akash:akash0912@learnmdb.hlomhum.mongodb.net/users");

const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});

const secret="nhikarpayegakoibhi";
userSchema.plugin(encrypt,{secret:secret, encryptedFields:["password"]});

const User = mongoose.model("User", userSchema);

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/submit", (req, res) => {
    res.render("submit");
});

app.post("/register", async (req, res) => {
    const user = new User({
        email: req.body.username,
        password: req.body.password
    });
    try {
        await user.save();
        res.render("secrets");
    } catch (error) {
        console.log(error);
    }
});

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        const founduser =await User.findOne({ email: username }).exec();
        if(founduser.password===password){
            res.render("secrets")
        }
    } catch (error) {

    }
})

app.listen(3000, () => {
    console.log("Server started successfully");
})
