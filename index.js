const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/user');
const app = express();
const bcrypt = require('bcrypt');
const session = require('express-session');
app.use(express.urlencoded({extended: true}));

mongoose.connect('mongodb://localhost:27017/authdemo',{useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((err) => {
    console.log('Error connecting to MongoDB', err);
});

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 60000
    }
}));


app.set('view engine', 'ejs');
app.set('views','views');

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { password , username} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({username, password: hashedPassword});
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isValid = await bcrypt.compare(password, user.password);
    if(isValid){
        req.session.user_id = user._id;
        res.redirect('/secret');
    }else{
        res.send('Invalid username or password');
    }
});

app.get('/secret', (req, res) => {
    if(!req.session.user_id){
        return res.redirect('/login');
    }
    res.render('secret');
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/', (req, res) => {
    res.send('Hello World');
}); 





app.listen(3000, () => {
    console.log('Server is running on port 3000');
});