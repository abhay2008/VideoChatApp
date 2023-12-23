const express = require("express");
const app = express();
const server = require("http").Server(app);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json())


const { v4: uuidv4 } = require("uuid");

const io = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
});

const { ExpressPeerServer } = require("peer")
const peerServer = ExpressPeerServer(server, {
    debug: true
});

app.use("/peerjs", peerServer);

let nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
        user: 'imaginediscorduto@gmail.com',
        pass: 'xlpo qvyw xsxb bdha'
    },
    secure: true,
})

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
    res.render("index", { roomId: req.params.room });
});

app.post("/send-mail", (req, res) => {
    console.log(req)
    if (req.body && req.body.to && req.body.url) {
        const to_check = req.body.to;
        const url = req.body.url;
        const mailData = {
            from: "imaginediscorduto@gmail.com",
            to: to_check,
            subject: "Join the video chat!",
            html: `<p>Hello there!</p><p>Join this Video Chat - ${url}</p>`
        };
        transporter.sendMail(mailData, (error, info) => {
            if (error) {
                return console.log(error);
            }
            res.status(200).send({message: "Command sent!", message_id: info.messageId});
        }) 
    } else {
        res.status(400).send({ error: "Missing required fields in request body" });
    }
})

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);
        io.to(roomId).emit("user-connected", userId);
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
        });
    });
});

server.listen(process.env.PORT || 3030);
