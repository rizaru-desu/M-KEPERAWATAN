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

app.get("/API-Menu", function (req, res, next) {
  const arrData = [
    {
      title: "Tips & Trik Uji Kompetensi",
      subtitle:
        "Berisi kumpulan video tips dan trik dalam Uji Kompetensi keperawatan.",
      illustration:
        "https://firebasestorage.googleapis.com/v0/b/materi-keperawatan.appspot.com/o/data%2Fimage%2Ficon-tip.png?alt=media&token=3abaecb2-d86a-4702-a0ff-8d45becfd18c",
      page: "PlayList",
    },
    {
      title: "S.O.P Keperawatan",
      subtitle: "Berisi kumpulan video S.O.P tentang Keperawatan.",
      illustration:
        "https://firebasestorage.googleapis.com/v0/b/materi-keperawatan.appspot.com/o/data%2Fimage%2Ficon-sop.png?alt=media&token=d8e1fd61-70ed-4313-a673-d814fd789156",
      page: "PlayList",
    },
    {
      title: "Jurnal Keperawatan",
      subtitle: "Berisi kumpulan jurnal keperawatan.",
      illustration:
        "https://firebasestorage.googleapis.com/v0/b/materi-keperawatan.appspot.com/o/data%2Fimage%2Ficon-jurnal.png?alt=media&token=b0f685dc-02fb-4a39-951c-08b6cafd55cb",
      page: "JurnalKeperawatan",
    },
    {
      title: "Kamus Kesehatan",
      subtitle: "Berisi istilah dan bahasa yang dipakai pada bidang kesehatan.",
      illustration:
        "https://firebasestorage.googleapis.com/v0/b/materi-keperawatan.appspot.com/o/data%2Fimage%2Ficon-ebook.png?alt=media&token=107657c9-9d21-4feb-9adb-1cf70705293e",
      page: "KamusKesehatan",
    },
    {
      title: "Tim Penyusun",
      subtitle: "Daftar profil tim penyusun dalam materi keperawatan.",
      illustration:
        "https://firebasestorage.googleapis.com/v0/b/materi-keperawatan.appspot.com/o/data%2Fimage%2Ficon-tim.png?alt=media&token=14cee5aa-6bbc-4e06-b2c1-a4a58283f986",
      page: "PenyusunKeperawatan",
    },
  ];
  res.send(arrData);
});

/**  API GET MENU */
app.get("/API-Materi", function (req, res, next) {
  res.send([
    {
      title: "Medikal Bedah",
      images:
        "https://firebasestorage.googleapis.com/v0/b/materi-keperawatan.appspot.com/o/data%2Fmateri%2Ficon%2Ficon-medikalbedah.png?alt=media&token=61196de6-7018-4ecd-89e4-112bfcec9774",
      index: "d3a54144796ef58cdd43c13f28b188b8",
    },
    {
      title: "Psikologi",
      images:
        "https://firebasestorage.googleapis.com/v0/b/materi-keperawatan.appspot.com/o/data%2Fmateri%2Ficon%2Ficon-piskologi.png?alt=media&token=01bbecc6-7559-4b5a-bb25-10e3da034636",
      index: "",
    },
    {
      title: "Kebutuhan Dasar Manusia",
      images:
        "https://firebasestorage.googleapis.com/v0/b/materi-keperawatan.appspot.com/o/data%2Fmateri%2Ficon%2Ficon-kebutuhan.png?alt=media&token=e152efa3-6546-4859-a9da-6b35856c56d1",
      index: "",
    },
    {
      title: "Pengantar Riset",
      images:
        "https://firebasestorage.googleapis.com/v0/b/materi-keperawatan.appspot.com/o/data%2Fmateri%2Ficon%2Ficon-riset.png?alt=media&token=ebbbe9c0-822e-47de-adf6-caa33f807fb7",
      index: "",
    },
    {
      title: "Promosi Kesehatan",
      images:
        "https://firebasestorage.googleapis.com/v0/b/materi-keperawatan.appspot.com/o/data%2Fmateri%2Ficon%2Ficon-promosi.png?alt=media&token=d27261cd-fa8a-49a2-978a-a57846556c74",
      index: "",
    },
    {
      title: "Manajemen Keselamatan",
      images:
        "https://firebasestorage.googleapis.com/v0/b/materi-keperawatan.appspot.com/o/data%2Fmateri%2Ficon%2Ficon-manajemenkeselamatan.png?alt=media&token=591703ec-8761-421a-8d7b-2822873b0ba3",
      index: "",
    },
    {
      title: "Komunitas & Keluarga",
      images:
        "https://firebasestorage.googleapis.com/v0/b/materi-keperawatan.appspot.com/o/data%2Fmateri%2Ficon%2Ficon-komunitas%26keluarga.png?alt=media&token=aeffa4a1-44a6-4780-af61-e98eec9950ac",
      index: "",
    },
    {
      title: "Kegawatdaruratan",
      images:
        "https://firebasestorage.googleapis.com/v0/b/materi-keperawatan.appspot.com/o/data%2Fmateri%2Ficon%2Ficon-ugd.png?alt=media&token=a62a4976-7bfa-48f1-8aad-e14c01c0b6e4",
      index: "",
    },
    {
      title: "Gerontik",
      images:
        "https://firebasestorage.googleapis.com/v0/b/materi-keperawatan.appspot.com/o/data%2Fmateri%2Ficon%2Ficon-gerontik.png?alt=media&token=2ee046f2-4250-4c24-b3e5-819333d3ac51",
      index: "",
    },
    {
      title: "Ilmu Gizi",
      images:
        "https://firebasestorage.googleapis.com/v0/b/materi-keperawatan.appspot.com/o/data%2Fmateri%2Ficon%2Ficon-gizi.png?alt=media&token=d6dd4c5f-802f-44f9-aae2-15825238ab4d",
      index: "",
    },
    {
      title: "Anak",
      images:
        "https://firebasestorage.googleapis.com/v0/b/materi-keperawatan.appspot.com/o/data%2Fmateri%2Ficon%2Ficon-anak.png?alt=media&token=ec253eec-a341-412f-be57-7dba8efb885d",
      index: "",
    },
    {
      title: "Konsep Dasar",
      images:
        "https://firebasestorage.googleapis.com/v0/b/materi-keperawatan.appspot.com/o/data%2Fmateri%2Ficon%2Ficon-konsepdasar.png?alt=media&token=3d50c2ec-50ca-4794-b377-327dc0fdb0ce",
      index: "",
    },
    {
      title: "Etika",
      images:
        "https://firebasestorage.googleapis.com/v0/b/materi-keperawatan.appspot.com/o/data%2Fmateri%2Ficon%2Ficon-etika.png?alt=media&token=beaf8b33-ecdd-491b-ad0a-5e39ff5f13ac",
      index: "",
    },
    {
      title: "Maternitas",
      images:
        "https://firebasestorage.googleapis.com/v0/b/materi-keperawatan.appspot.com/o/data%2Fmateri%2Ficon%2Ficon-maternitas.png?alt=media&token=653c67d7-2e6e-4786-a7c1-f0b09665294b",
      index: "",
    },
    {
      title: "Manajemen",
      images:
        "https://firebasestorage.googleapis.com/v0/b/materi-keperawatan.appspot.com/o/data%2Fmateri%2Ficon%2Ficon-manajemen.png?alt=media&token=f5800238-2a8c-48f9-8522-9b2279ffdb90",
      index: "",
    },
    {
      title: "Komunikasi",
      images:
        "https://firebasestorage.googleapis.com/v0/b/materi-keperawatan.appspot.com/o/data%2Fmateri%2Ficon%2Ficon-komunikasi.png?alt=media&token=60e23e60-411b-45f9-9911-359d03f802e4",
      index: "",
    },
    {
      title: "Biomedik",
      images:
        "https://firebasestorage.googleapis.com/v0/b/materi-keperawatan.appspot.com/o/data%2Fmateri%2Ficon%2Ficon-biomedik.png?alt=media&token=d3bf3f18-74ca-47f2-8b3d-3081d9e9309e",
      index: "",
    },
    {
      title: "Farmakologi",
      images:
        "https://firebasestorage.googleapis.com/v0/b/materi-keperawatan.appspot.com/o/data%2Fmateri%2Ficon%2Ficon-farmakologi.png?alt=media&token=0e6d83f2-0658-49e9-a803-378c4376d5c0",
      index: "",
    },
    {
      title: "Mikrobiologi",
      images:
        "https://firebasestorage.googleapis.com/v0/b/materi-keperawatan.appspot.com/o/data%2Fmateri%2Ficon%2Ficon-mikrobiologi.png?alt=media&token=c3cc7ebc-bb48-4297-8fd7-1cdf9af5e29a",
      index: "",
    },
    {
      title: "Jiwa",
      images:
        "https://firebasestorage.googleapis.com/v0/b/materi-keperawatan.appspot.com/o/data%2Fmateri%2Ficon%2Ficon-jiwa.png?alt=media&token=96e4fc47-e963-4709-b646-ce9a33141a5d",
      index: "",
    },
  ]);
});

app.listen(port, () => {
  console.log("Listening on port local");
});
