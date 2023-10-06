import express from "express";
// import ejs from "ejs";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import 'dotenv/config';
// import encrypt from "mongoose-encryption"; //for encryption using secret key defined in .env file
// import md5 from "md5";  hashing for encryption
// import bcrypt from "bcrypt"; for salt and hashing for encryption
import session from "express-session";
import passport from "passport";
import passportLocalMonngoose from "passport-local-mongoose";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import findOrCreate from "mongoose-findorcreate";


// const saltRounds = 10; numbers of rounds in salt hashing
const app = express();

app.use(session({
    secret: "my little secret is dumb",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://akash:akash0912@learnmdb.hlomhum.mongodb.net/users");

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String
});
userSchema.plugin(passportLocalMonngoose)
userSchema.plugin(findOrCreate)

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, {
            id: user.id,
            username: user.username,
            picture: user.picture
        });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
},
    function (accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
));

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("home");
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect secrets.
        res.redirect('/secrets');
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
})

app.listen(3000, () => {
    console.log("Server started successfully");
})
