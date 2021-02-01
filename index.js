const express = require("express");
const app = express();
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");
let port = process.env.PORT || 3000;

let transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tim.sahabatalter@gmail.com",
    pass: "Alter123.",
  },
});

const serviceAccount = require("./service_account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://materi-keperawatan-default-rtdb.firebaseio.com",
});

app.use(bodyParser.json({ type: "application/json" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static("client"));

/**  API CREATE USER*/
app.post("/API-Create", function (req, res, next) {
  admin
    .auth()
    .createUser({
      email: req.body.email,
      emailVerified: false,
      phoneNumber: req.body.phoneNumber,
      password: req.body.password,
      displayName: req.body.displayName,
      photoURL:
        "https://firebasestorage.googleapis.com/v0/b/materi-keperawatan.appspot.com/o/data%2Fprofile.png?alt=media&token=d99bdc0e-22bf-4749-a792-4d562b52dfcc",
      disabled: false,
    })
    .then((userRecord) => {
      // See the UserRecord reference doc for the contents of userRecord.
      var usersRef = admin.database().ref("/").child(userRecord.uid);
      usersRef.set({
        displayCampus: req.body.displayCampus,
        serialKey: req.body.serialKey,
        previllage: req.body.previllage,
      });
      res.send({
        message: userRecord.uid,
      });
      // See the UserRecord reference doc for the contents of userRecord.
      console.log("Successfully created new user:", userRecord.uid);
    })
    .catch((error) => {
      res.send(error);
    });
});

app.get("/API-Penyusun", function (req, res, next) {
  fs.readFile("Api/penyusun.json", (err, data) => {
    if (err) throw err;
    let penyusun = JSON.parse(data);
    res.send(penyusun);
  });
});

app.get("/API-Menu", function (req, res, next) {
  fs.readFile("Api/penyusun.json", (err, data) => {
    if (err) throw err;
    let menu = JSON.parse(data);
    res.send(menu);
  });
});

/**  API GET MENU */
app.get("/API-Materi", function (req, res, next) {
  fs.readFile("Api/penyusun.json", (err, data) => {
    if (err) throw err;
    let materi = JSON.parse(data);
    res.send(materi);
  });
});

/**  API GET KAMUS*/
app.get("/API-Kamus", function (req, res, next) {
  fs.readFile("Api/kamus.json", (err, data) => {
    if (err) throw err;
    let materi = JSON.parse(data);
    res.send(materi);
  });
});

app.listen(port, () => {
  console.log("Listening on port local");
});
