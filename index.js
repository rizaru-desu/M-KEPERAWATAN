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
        previllage: false,
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

/** FIND USER */
app.post("/find-email", function (req, res, next) {
  admin
    .auth()
    .getUserByEmail(req.body.usergetEmail)
    .then((userRecord) => {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log(`Successfully fetched user data: ${userRecord.toJSON()}`);
      res.send(userRecord.toJSON());
    })
    .catch((error) => {
      console.log("Error fetching user data:", error);
    });
});

/** REMOVE USER */
app.post("/remove-users", function (req, res, next) {
  admin
    .auth()
    .deleteUser(req.body.useruid)
    .then(function () {
      console.log("Successfully deleted user");
      var adaRef = admin.database().ref("/" + req.body.useruid);
      adaRef
        .remove()
        .then(function () {
          console.log("Remove succeeded.");
        })
        .catch(function (error) {
          res.send(error);
        });
      res.send({
        data: "Remove succeeded.",
      });
    })
    .catch(function (error) {
      res.send(error);
    });
});

/** CHANGE KEY*/
app.post("/change-key", function (req, res, next) {
  var usersRef = admin.database().ref("/").child(req.body.useruid);
  usersRef
    .update({
      serialKey: req.body.serialKey,
    })
    .then(function () {
      res.send({
        data: "Change Key succeeded.",
      });
    });
});

/** GET DATA */
app.post("/get-db", function (req, res, next) {
  var db = admin.database();
  var ref = db.ref("/" + req.body.useruid);
  ref.once("value").then(function (snapshot) {
    res.send({
      data: snapshot.val().serialKey,
    });
  });
});

app.post("/API-MKEP", function (req, res, next) {
  fs.readFile("Api/" + req.body.nameJSON, (err, data) => {
    if (err) throw err;
    let json = JSON.parse(data);
    res.send(json);
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
  fs.readFile("Api/materi.json", (err, data) => {
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

/**  API GET OBAT*/
app.get("/API-Obat", function (req, res, next) {
  fs.readFile("Api/obat.json", (err, data) => {
    if (err) throw err;
    let materi = JSON.parse(data);
    res.send(materi);
  });
});

/**  API GET OBAT*/
app.get("/API-Jurnal", function (req, res, next) {
  fs.readFile("Api/jurnal.json", (err, data) => {
    if (err) throw err;
    let materi = JSON.parse(data);
    res.send(materi);
  });
});

/** SEND MAIN VERIFICATION AND FORGOT PASSWORD */
app.post("/reset", function (req, res) {
  const useremail = req.body.usergetEmail;
  admin
    .auth()
    .generatePasswordResetLink(useremail)
    .then((link) => {
      // Construct password reset email template, embed the link and send
      // using custom SMTP server.
      let mailOptions = {
        from: "Dont Reply <tim.sahabatalter@gmail.com>",
        to: useremail,
        subject: "Permintaan Reset Kata Sandi",
        html:
          '<!doctype html> <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"> <head> <title> </title> <!--[if !mso]><!-- --> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!--<![endif]--> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1"> <style type="text/css"> #outlook a { padding:0; } .ReadMsgBody { width:100%; } .ExternalClass { width:100%; } .ExternalClass * { line-height:100%; } body { margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; } table, td { border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt; } img { border:0;height:auto;line-height:100%; outline:none;text-decoration:none;-ms-interpolation-mode:bicubic; } p { display:block;margin:13px 0; } </style> <!--[if !mso]><!--> <style type="text/css"> @media only screen and (max-width:480px) { @-ms-viewport { width:320px; } @viewport { width:320px; } } </style> <!--<![endif]--> <!--[if mso]> <xml> <o:OfficeDocumentSettings> <o:AllowPNG/> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml> <![endif]--> <!--[if lte mso 11]> <style type="text/css"> .outlook-group-fix { width:100% !important; } </style> <![endif]--> <!--[if !mso]><!--> <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css"> <link href="https://fonts.googleapis.com/css?family=Cabin:400,700" rel="stylesheet" type="text/css"> <style type="text/css"> @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700); @import url(https://fonts.googleapis.com/css?family=Cabin:400,700); </style> <!--<![endif]--><style type="text/css"> @media only screen and (min-width:480px) { .mj-column-per-100 { width:100% !important; max-width: 100%; } } </style> <style type="text/css"> </style> <style type="text/css">.hide_on_mobile { display: none !important;} @media only screen and (min-width: 480px) { .hide_on_mobile { display: block !important;} } .hide_section_on_mobile { display: none !important;} @media only screen and (min-width: 480px) { .hide_section_on_mobile { display: table !important;} } .hide_on_desktop { display: block !important;} @media only screen and (min-width: 480px) { .hide_on_desktop { display: none !important;} } .hide_section_on_desktop { display: table !important;} @media only screen and (min-width: 480px) { .hide_section_on_desktop { display: none !important;} } [owa] .mj-column-per-100 { width: 100%!important; } [owa] .mj-column-per-50 { width: 50%!important; } [owa] .mj-column-per-33 { width: 33.333333333333336%!important; } p { margin: 0px; } @media only print and (min-width:480px) { .mj-column-per-100 { width:100%!important; } .mj-column-per-40 { width:40%!important; } .mj-column-per-60 { width:60%!important; } .mj-column-per-50 { width: 50%!important; } mj-column-per-33 { width: 33.333333333333336%!important; } }</style> </head> <body style="background-color:#FFFFFF;"> <div style="background-color:#FFFFFF;"> <!--[if mso | IE]> <table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" > <tr> <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"> <![endif]--> <div style="Margin:0px auto;max-width:600px;"> <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"> <tbody> <tr> <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;"> <!--[if mso | IE]> <table role="presentation" border="0" cellpadding="0" cellspacing="0"> <tr> <td class="" style="vertical-align:top;width:600px;" > <![endif]--> <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"> <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"> <tr> <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;"> <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"> <p><span style="font-size: 16px; font-family: \'comic sans ms\', sans-serif;">Hai, Sahabat Alter Indonesia</span></p> </div> </td> </tr> </table> </div> <!--[if mso | IE]> </td> </tr> </table> <![endif]--> </td> </tr> </tbody> </table> </div> <!--[if mso | IE]> </td> </tr> </table> <table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" > <tr> <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"> <![endif]--> <div style="Margin:0px auto;max-width:600px;"> <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"> <tbody> <tr> <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;"> <!--[if mso | IE]> <table role="presentation" border="0" cellpadding="0" cellspacing="0"> <tr> <td class="" style="vertical-align:top;width:600px;" > <![endif]--> <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"> <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"> <tr> <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;"> <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"> <p><span style="font-size: 14px; font-family: \'comic sans ms\', sans-serif;">Kami mengirimkan email ini karena Anda meminta pengaturan ulang kata sandi. Klik tautan ini untuk membuat kata sandi baru:</span></p> </div> </td> </tr> </table> </div> <!--[if mso | IE]> </td> </tr> </table> <![endif]--> </td> </tr> </tbody> </table> </div> <!--[if mso | IE]> </td> </tr> </table> <table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" > <tr> <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"> <![endif]--> <div style="Margin:0px auto;max-width:600px;"> <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"> <tbody> <tr> <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;"> <!--[if mso | IE]> <table role="presentation" border="0" cellpadding="0" cellspacing="0"> <tr> <td class="" style="vertical-align:top;width:600px;" > <![endif]--> <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"> <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"> <tr> <td align="center" vertical-align="middle" style="font-size:0px;padding:20px 20px 20px 20px;word-break:break-word;"> <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;line-height:100%;"> <tr> <td align="center" bgcolor="#e85034" role="presentation" style="border:0px solid #000;border-radius:24px;cursor:auto;mso-padding-alt:9px 26px 9px 26px;background:#e85034;" valign="middle"> <a href="' +
          link +
          '" style="display:inline-block;background:#e85034;color:#ffffff;font-family:Ubuntu, Helvetica, Arial, sans-serif, Helvetica, Arial, sans-serif;font-size:13px;font-weight:normal;line-height:100%;Margin:0;text-decoration:none;text-transform:none;padding:9px 26px 9px 26px;mso-padding-alt:0px;border-radius:24px;" target="_blank"> <div><span style="font-family: \'comic sans ms\', sans-serif;">RESET</span> KATA SANDI</div> </a> </td> </tr> </table> </td> </tr> </table> </div> <!--[if mso | IE]> </td> </tr> </table> <![endif]--> </td> </tr> </tbody> </table> </div> <!--[if mso | IE]> </td> </tr> </table> <table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" > <tr> <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"> <![endif]--> <div style="Margin:0px auto;max-width:600px;"> <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"> <tbody> <tr> <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;"> <!--[if mso | IE]> <table role="presentation" border="0" cellpadding="0" cellspacing="0"> <tr> <td class="" style="vertical-align:top;width:600px;" > <![endif]--> <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"> <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"> <tr> <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;"> <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"> <p><span style="font-family: \'comic sans ms\', sans-serif; font-size: 14px;">Jika Anda tidak meminta pengaturan ulang kata sandi, Anda dapat mengabaikan email ini. Kata sandi Anda tidak akan diubah.</span></p> </div> </td> </tr> </table> </div> <!--[if mso | IE]> </td> </tr> </table> <![endif]--> </td> </tr> </tbody> </table> </div> <!--[if mso | IE]> </td> </tr> </table> <![endif]--> </div> </body> </html>',
      };

      transport.sendMail(mailOptions, function (err, data) {
        if (err) {
          console.log("Error Occurs");
        } else {
          console.log("email sent!!!!");
        }
      });

      res.send({
        data: useremail,
      });
      return sendCustomPasswordResetEmail(useremail, link);
    })
    .catch(function (error) {
      res.send(error.message);
    });
});

app.post("/verified", function (req, res) {
  const useremail = req.body.usergetEmail;
  admin
    .auth()
    .generateEmailVerificationLink(useremail)
    .then((link) => {
      // Construct email verification template, embed the link and send
      // using custom SMTP server.
      let mailOptions = {
        from: "Dont Reply <tim.sahabatalter@gmail.com>",
        to: useremail,
        subject: "Permintaan Verifikasi Email",
        html:
          '<!doctype html> <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"> <head> <title> </title> <!--[if !mso]><!-- --> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!--<![endif]--> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1"> <style type="text/css"> #outlook a { padding:0; } .ReadMsgBody { width:100%; } .ExternalClass { width:100%; } .ExternalClass * { line-height:100%; } body { margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; } table, td { border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt; } img { border:0;height:auto;line-height:100%; outline:none;text-decoration:none;-ms-interpolation-mode:bicubic; } p { display:block;margin:13px 0; } </style> <!--[if !mso]><!--> <style type="text/css"> @media only screen and (max-width:480px) { @-ms-viewport { width:320px; } @viewport { width:320px; } } </style> <!--<![endif]--> <!--[if mso]> <xml> <o:OfficeDocumentSettings> <o:AllowPNG/> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml> <![endif]--> <!--[if lte mso 11]> <style type="text/css"> .outlook-group-fix { width:100% !important; } </style> <![endif]--> <!--[if !mso]><!--> <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css"> <link href="https://fonts.googleapis.com/css?family=Cabin:400,700" rel="stylesheet" type="text/css"> <style type="text/css"> @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700); @import url(https://fonts.googleapis.com/css?family=Cabin:400,700); </style> <!--<![endif]--><style type="text/css"> @media only screen and (min-width:480px) { .mj-column-per-100 { width:100% !important; max-width: 100%; } } </style> <style type="text/css"> </style> <style type="text/css">.hide_on_mobile { display: none !important;} @media only screen and (min-width: 480px) { .hide_on_mobile { display: block !important;} } .hide_section_on_mobile { display: none !important;} @media only screen and (min-width: 480px) { .hide_section_on_mobile { display: table !important;} } .hide_on_desktop { display: block !important;} @media only screen and (min-width: 480px) { .hide_on_desktop { display: none !important;} } .hide_section_on_desktop { display: table !important;} @media only screen and (min-width: 480px) { .hide_section_on_desktop { display: none !important;} } [owa] .mj-column-per-100 { width: 100%!important; } [owa] .mj-column-per-50 { width: 50%!important; } [owa] .mj-column-per-33 { width: 33.333333333333336%!important; } p { margin: 0px; } @media only print and (min-width:480px) { .mj-column-per-100 { width:100%!important; } .mj-column-per-40 { width:40%!important; } .mj-column-per-60 { width:60%!important; } .mj-column-per-50 { width: 50%!important; } mj-column-per-33 { width: 33.333333333333336%!important; } }</style> </head> <body style="background-color:#FFFFFF;"> <div style="background-color:#FFFFFF;"> <!--[if mso | IE]> <table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" > <tr> <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"> <![endif]--> <div style="Margin:0px auto;max-width:600px;"> <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"> <tbody> <tr> <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;"> <!--[if mso | IE]> <table role="presentation" border="0" cellpadding="0" cellspacing="0"> <tr> <td class="" style="vertical-align:top;width:600px;" > <![endif]--> <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"> <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"> <tr> <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;"> <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"> <p><span style="font-size: 16px; font-family: \'comic sans ms\', sans-serif;">Hai, Sahabat Alter Indonesia</span></p> </div> </td> </tr> </table> </div> <!--[if mso | IE]> </td> </tr> </table> <![endif]--> </td> </tr> </tbody> </table> </div> <!--[if mso | IE]> </td> </tr> </table> <table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" > <tr> <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"> <![endif]--> <div style="Margin:0px auto;max-width:600px;"> <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"> <tbody> <tr> <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;"> <!--[if mso | IE]> <table role="presentation" border="0" cellpadding="0" cellspacing="0"> <tr> <td class="" style="vertical-align:top;width:600px;" > <![endif]--> <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"> <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"> <tr> <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;"> <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"> <p><span style="font-size: 14px; font-family: \'comic sans ms\', sans-serif;">Kami mengirimkan email ini karena Anda meminta email verifikasi. Klik tautan ini untuk verifikasi email:</span></p> </div> </td> </tr> </table> </div> <!--[if mso | IE]> </td> </tr> </table> <![endif]--> </td> </tr> </tbody> </table> </div> <!--[if mso | IE]> </td> </tr> </table> <table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" > <tr> <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"> <![endif]--> <div style="Margin:0px auto;max-width:600px;"> <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"> <tbody> <tr> <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;"> <!--[if mso | IE]> <table role="presentation" border="0" cellpadding="0" cellspacing="0"> <tr> <td class="" style="vertical-align:top;width:600px;" > <![endif]--> <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"> <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"> <tr> <td align="center" vertical-align="middle" style="font-size:0px;padding:20px 20px 20px 20px;word-break:break-word;"> <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;line-height:100%;"> <tr> <td align="center" bgcolor="#e85034" role="presentation" style="border:0px solid #000;border-radius:24px;cursor:auto;mso-padding-alt:9px 26px 9px 26px;background:#e85034;" valign="middle"> <a href="' +
          link +
          '" style="display:inline-block;background:#e85034;color:#ffffff;font-family:Ubuntu, Helvetica, Arial, sans-serif, Helvetica, Arial, sans-serif;font-size:13px;font-weight:normal;line-height:100%;Margin:0;text-decoration:none;text-transform:none;padding:9px 26px 9px 26px;mso-padding-alt:0px;border-radius:24px;" target="_blank"> <div><span style="font-family: \'comic sans ms\', sans-serif;">VERIFIKASI</span> EMAIL</div> </a> </td> </tr> </table> </td> </tr> </table> </div> <!--[if mso | IE]> </td> </tr> </table> <![endif]--> </td> </tr> </tbody> </table> </div> <!--[if mso | IE]> </td> </tr> </table> <table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" > <tr> <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"> <![endif]--> <div style="Margin:0px auto;max-width:600px;"> <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"> <tbody> <tr> <td style="direction:ltr;font-size:0px;padding:9px 0px 9px 0px;text-align:center;vertical-align:top;"> <!--[if mso | IE]> <table role="presentation" border="0" cellpadding="0" cellspacing="0"> <tr> <td class="" style="vertical-align:top;width:600px;" > <![endif]--> <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"> <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"> <tr> <td align="left" style="font-size:0px;padding:15px 15px 15px 15px;word-break:break-word;"> <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;color:#000000;"> <p><span style="font-family: \'comic sans ms\', sans-serif; font-size: 14px;">Jika Anda tidak meminta email verifikasi, Anda dapat mengabaikan email ini.</span></p> </div> </td> </tr> </table> </div> <!--[if mso | IE]> </td> </tr> </table> <![endif]--> </td> </tr> </tbody> </table> </div> <!--[if mso | IE]> </td> </tr> </table> <![endif]--> </div> </body> </html>',
      };

      transport.sendMail(mailOptions, function (err, data) {
        if (err) {
          console.log("Error Occurs");
        } else {
          console.log("email sent!!!!");
        }
      });

      res.send({
        data: useremail,
      });
      return sendCustomVerificationEmail(useremail, link);
    })
    .catch(function (error) {
      res.send(error.message);
    });
});

app.listen(port, () => {
  console.log("Listening on port local");
});
