import express from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import mongoose, { Post, User } from "./model/index.js";
dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

const PORT = process.env.BE_PORT || 3000;
const app = express();


const ReactAppDistPath = new URL('../front-end/dist/', import.meta.url);
const ReactAppIndex = new URL('../front-end/dist/index.html', import.meta.url);

app.use(express.json());
app.use(express.static(ReactAppDistPath.pathname));
/*
 * express.static match auf jede Datei im angegebenen Ordner
 * und erstellt uns einen request handler for FREE
 * app.get("/",(req,res)=> res.sendFile("path/to/index.html"))
 * app.get("/index.html",(req,res)=> res.sendFile("path/to/index.html"))
 */



const generateAccessToken = (userMail) => {

    return jwt.sign({ userMail }, process.env.TOKEN_SECRET, { expiresIn: 1800 });
}

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) {
        return res.sendStatus(401)
    }
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        console.log(err)
        if (err) return res.sendStatus(403)

        req.user = user

        next()
    })
}

app.get('/api/status', authenticateToken, (req, res) => {
    res.send({ status: "Ok" });
});

app.get('/*', (req, res) => {
    res.sendFile(ReactAppIndex.pathname);
});

app.post('/api/signup', async (req, res) => {
    const { name, mail, password } = req.body;

    try {
        const newUser = await User.create({ name: name, mail: mail });
        //setpassword and save
        await newUser.setPassword(password)
        await newUser.save()
    }
    catch (err) {
        console.error(err)
    }
});

app.post('/api/login', async (req, res) => {
    // check if user is in database
    let { mail, password } = req.body;
    console.log(req.body);
    const user = await User.findOne({ mail: mail });

    if (user == null) {
        return res.status(400).send('user not found')
    }

    //check given password with found user
    if (!user.verifyPassword(password)) {
        return res.sendStatus(401)
    }

    // generates jwt 
    const token = generateAccessToken(user.mail)
    await res.json(token);
})

app.listen(PORT, () => {
    console.log('Server running on Port: ', PORT);
});
