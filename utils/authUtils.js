const validator = require("validator");
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")

const cleanUpAndValidate = ({ email, password, name, username}) => {
  return new Promise((resolve, reject) => {
    if (!email || !name || !username || !password)
      reject("Missing Credentials");
     
     if (typeof email !== "string") reject("Datatype of email is incorrect");
    if (typeof name !== "string") reject("Datatype of name is incorrect");
    if (typeof username !== "string") reject("Datatype of username is incorrect");
    if (typeof password !== "string")
      reject("Datatype of password is incorrect");

    if (username.length <= 2 || username.length > 30)
      reject("Username should be of 3-30 chars");
    if (password.length <= 2 || password.length > 30)
      reject("Password should be of 3-30 chars");

    if (!validator.isEmail(email)) reject("Format of email is wrong");

    resolve();
  });
};

 const loginValidation = ({loginId ,password})=>{
  return new Promise((resolve,reject)=>{
    if(!loginId)
    reject("loginId missing")
  if(!password){
    reject("Password missing")
  }
 
    resolve();
  })
}

const generateJWTToken = (email)=>{
  const token  = jwt.sign(email,process.env.SECRET_KEY)
  return token
}

const sendVerificationEmail = ({email,username,verificationToken}) =>{

  const transporter = nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:465,
    secure:true,
    service:"gmail",
    auth:{
      user:"muskandodmani25@gmail.com",
      pass:"ncuv ryca obgk wptj",
    },
  })
  
  const mailOptions ={
    from :"muskandomani25@gmail.com",
    to:email,
    subject:"Email verification for TODO app",
    html:`<h2>Hello ${username} ,</h2>
    <p>We just need to verify your email address before you can access our portal.</p>

    <p>Kindly <a href='http://localhost:8000/verifytoken/${verificationToken}'>click here </a>and proceed to login </p>
    
    <p>Thanks!</p>`,
  }

  transporter.sendMail(mailOptions, (error,info)=>{
     if(error) {
      console.log("nodemailer : ",error) 
    } 
      else console.log("Email has been sent successfully: "+ info.response)
    
  })
}

const sendVerificationResetPassword = ({email,verificationToken}) =>{

  const transporter = nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:465,
    secure:true,
    service:"gmail",
    auth:{
      user:"muskandodmani25@gmail.com",
      pass:"ncuv ryca obgk wptj",
    },
  })
  
  const mailOptions ={
    from :"muskandomani25@gmail.com",
    to:email,
    subject:"Password Reset request for TODO app",
    html:`<h2>Hello there!</h2>
    <p>We just need to verify before you can access our portal.</p>

    <p>Is it you who wants to reset the password ? </p>  <a href='http://localhost:8000/verifytoken/forgotPassword/${verificationToken}'>Yes</a> 
    
    <p>Thanks!</p>`,
  }

  transporter.sendMail(mailOptions, (error,info)=>{
     if(error) {
      console.log("nodemailer : ",error) 
    } 
      else console.log("Email has been sent successfully: "+ info.response)
    
  })
}

module.exports = { cleanUpAndValidate,loginValidation,generateJWTToken,sendVerificationEmail, sendVerificationResetPassword };
 

 

 