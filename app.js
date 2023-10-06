import express from "express";
// import ejs from "ejs";
import bodyParser from "body-parser";
import mongoose from "mongoose";
// import 'dotenv/config';
// import encrypt from "mongoose-encryption"; for encryption using secret key defined in .env file
// import md5 from "md5";  hashing for encryption
// import bcrypt from "bcrypt"; for salt and hashing for encryption
import session from "express-session";
import passport from "passport";
import passportLocalMonngoose from "passport-local-mongoose";

// const saltRounds = 10; numbers of rounds in salt hashing
const app = express();

app.use(session({
    secret: "my little secret",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://akash:akash0912@learnmdb.hlomhum.mongodb.net/users");
//   mongoose.connect("mongodb://127.0.0.1:27017/users");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
// userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields:["password"]}); secret key for encryption
userSchema.plugin(passportLocalMonngoose)

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});
app.get('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});
app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/submit", (req, res) => {
    res.render("submit");
});
app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }

});


// app.post("/register", (req, res) => {
//     bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
//         const user = new User({
//             email: req.body.username,
//             password: hash
//         })
//         try {
//             await user.save();
//             res.render("secrets");
//         } catch (error) {
//             console.log(error);
//         }
//     })
// });

// app.post("/login", async (req, res) => {
//     const username = req.body.username;
//     try {
//         const founduser = await User.findOne({ email: username }).exec();
//         // md5(password)
//         if (founduser) {
//             bcrypt.compare(req.body.password, founduser.password, function (err, result) {
//                 if (result == true) {
//                     res.render("secrets");
//                 }
//             });
//         }
//     } catch (error) {
//         console.log(error)
//     }
// })
app.post("/register", async (req, res) => {
    User.register({ username: req.body.username }, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            res.redirect("/register");
        }
        else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            })
        }
    })
})

app.post("/login", (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })
    req.login(user, (err) => {
        if (err) {
            console.log(err)
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets")
            })
        }
    })
    // req.login(user, function (err) {
    //     if (err) { return next(err); }
    //     return res.redirect("/secrets");  not working authrizing even if the passwod is wrong
    // });
})

app.listen(3000, () => {
    console.log("Server started successfully");
})
