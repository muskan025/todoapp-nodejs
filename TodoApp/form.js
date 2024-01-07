
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const session = require("express-session");
const mongodbsession = require("connect-mongodb-session")(session);
var clc = require("cli-color");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken")

const userModel = require("../models/userModel");
const sessionModel = require("../models/sessionModel");
const todoModel = require("../models/todoModel");
const { cleanUpAndValidate, loginValidation, generateJWTToken, sendVerificationEmail, sendVerificationResetPassword } = require("../utils/authUtils");
const { validateTodo, validateUpdateTodo } = require("../utils/todoUtils");
const { isAuth } = require("../middlewares/isAuth");
const ratelimiting = require("../middlewares/rateLimiting");
const accessModel = require("../models/accessModel");



const PORT = process.env.PORT;
 
const app = express();
 
const store = new mongodbsession({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

//middlewares

//to tell express where are the ejs file
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDb connected");
  })
  .catch((error) => {
    console.log(error);
  });

app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(express.static("public"));
//routes
app.get("/register", (req, res) => {
  return res.render("register");
});
app.get("/login", (req, res) => {
  return res.render("login");
});
// app.get("/reset-password", (req,res)=>{
//   return res.render("forgotPassword")
// }) 
app.get("/resetting-password", (req,res)=>{
  return res.render("forgotPassword")
}) 

 
 

app.post("/register", async (req, res) => {
  const { name, email, password, username } = req.body;
 
  try {
    await cleanUpAndValidate({ name, email, password, username });
  } catch (error) {
     return res.send({ 
      status: 400,
      error: error,
      message: "registeration failed", 
    });
  }

  try {
    // no same feilds should be in DB

    const userEmailExists = await userModel.findOne({ email });
    if (userEmailExists) {
     return res.send({
        status: 400,
        error: "Email already exists",
        data: email,
      });
    }

    const userUsernameExists = await userModel.findOne({ username });
    if (userUsernameExists) {
     return res.send({
        status: 400,
        error: "Username already exists",
        data: username,
      });
    }

    //hashing password
    const hashedPassed = await bcrypt.hash(
      password,
      parseInt(process.env.SALT)
    );

     //creating user in db
    const userObj = new userModel({
      name: name,
      email: email,
      username: username,
      password: hashedPassed,
    });

    const userDb = await userObj.save();

    const verificationToken = generateJWTToken(email)
    console.log("verificationToken",verificationToken)

    sendVerificationEmail({email,username,verificationToken}) 

    return res.send({
      status:201,
      message:"Please check your gmail for email verification",
      data:userDb
    })
    
  } catch (err) { 
    return res.send({
      status: 500,
      message: "Database error",
      error: err,
    });
  }
});


app.get("/verifyToken/:id",(req,res)=>{

  const token = req.params.id;
console.log(token)

jwt.verify(token,process.env.SECRET_KEY,async (error,email)=>{
   try{
    await userModel.findOneAndUpdate({email},{isEmailAuthenticated:true})

    return res.redirect("/login")
   }
   catch(error){
 return res.send({ 
  status:500,
  message:"Database error",
  error:error
})
   }
})
   
})

app.post("/login", async (req, res) => { 

  const { loginId, password } = req.body;
   //data validation
  try {
    await loginValidation({ loginId, password });
  } catch (error) {
   
    return res.send({
      status: 400,
      message: "Login failed",
      error: error,
    });
  }

  try {
    let userDb = {};

    if (validator.isEmail(loginId)) {
      userDb = await userModel.findOne({ email: loginId });
    } else {
      userDb = await userModel.findOne({ username: loginId });
    }

    if (!userDb) {
      return res.send({
        status: 400,
        message: "Login Id not found, please register first",
      });
    }

    if(!userDb.isEmailAuthenticated){
return res.send({
  status:401,
  message:"Please verify your email Id by clicking on the link provided in your email"
})
  }

    const isMatch = await bcrypt.compare(password, userDb.password);

    if (!isMatch) {
      return res.send({
        status: 400,
        message: "Password incorrect",
      });
    }

    //Session base Auth
     req.session.isAuth = true;
    req.session.user = {
      name: userDb.name,
      username: userDb.username,
      email: userDb.email, 
      password: userDb.password,
    };
return res.send({
  status: 200,
  message:"Login successful",
})
      
  } catch (error) {
    return res.send({
      status: 500,
      message:"Database error",
      error:error
    });
  }
});

app.post("/resend-email",async (req,res)=>{

  const {email,username} = req.body

 try{
  const verificationToken = generateJWTToken(email)

  sendVerificationEmail({email,username,verificationToken}) 

  return res.send({
    status:201,
    message:"Kindly check your gmail  to verify it's you",
  })
 }
 catch(err){
  return res.send({
    status:500,
    message:"Database error",
    error:err
  })
 }


})

app.post("/forgot-password",async(req,res)=>{

  const email = req.body.loginId
 
let userDb 
  if(validator.isEmail(email)){
      userDb = await userModel.findOne({email:email})
}
else {
    userDb = await userModel.findOne({username:email})
}
  if(!userDb){
    return res.send({
      status:400,
      message:"loginID does not match,please try again"
    })
  }

  try{
  const verificationToken = generateJWTToken(email)
  console.log("verificationToken",verificationToken)

  sendVerificationResetPassword({email,verificationToken}) 
  
    return res.send({
      status:200,
      message:"Kindly check your gmail to verify it's you",
    })
   }
   catch(err){
    console.log(err)
    return res.send({
      status:500,
      message:"Database error",
      error:err
    })
   }

})

app.get("/verifyToken/forgotPassword/:id",(req,res)=>{

  const token = req.params.id;
 
jwt.verify(token,process.env.SECRET_KEY,async (error,email)=>{
   try{
    await userModel.findOneAndUpdate({email},{isPasswordAuthenticated:true})

    return res.redirect("/resetting-password")
   }
   catch(error){
 return res.send({ 
  status:500,
  message:"Database error",
  error:error
})
   }
})
   
})

app.post("/reset-password",async(req,res)=>{

const email = req.body.email
const password = req.body.password

     try{
      
      const userDb = await userModel.findOne({email:email})

      if(!userDb.isPasswordAuthenticated){
        return res.send({
          status:401,
          message:"Unauthorised to reset the password",
        })
      }


      const hashedPassword = await bcrypt.hash(password,parseInt(process.env.SALT))
    await userModel.findOneAndUpdate({email},{password:hashedPassword})
    return res.send({
      status:200,
      message:"Password reset successful!",
    })
   } 
   catch(err){
return res.send({
  status:500,
  message:"Database error",
  error:err
})
   }

})

app.get("/dashboard", isAuth, async (req, res) => {
  try {
    const username = req.session.user.username;

    const todos = await todoModel.find({ username: username });
 
    return res.render("dashboard", { todos: todos });
  } catch (error) {
    return res.send(error);
  }
});

app.post("/create-todo", isAuth,ratelimiting,async (req, res) => {
  const todo = req.body.todo;
  const username = req.session.user.username;

   
  //data validation
  try {
    await validateTodo({ todo });
  } catch (error) {
    res.send({
      status: 400,
      error: error,
    });
  }

  //save todo in DB
  const todoObj = new todoModel({
    todo: todo,
    username: username,
  });

  try {
    const todoDb = await todoObj.save();

    return res.send({
      status: 201,
      message: "Todo created sucessfully",
      data: todoDb,
    });
  } catch (error) {
     return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

app.post("/edit-todo", isAuth, async (req, res) => {
  const { id, todo } = req.body;

  // todo validation
  try {
    await validateUpdateTodo({ id, todo });
  } catch (error) {
    return res.send({
      status: 400,
      error: error,
    });
  }

  //find the todo from db
  try {
    const todoDB = await todoModel.findOne({ _id: id });
    //check if id exists
    if (!todoDB) {
      return res.send({
        status: 400,
        message: "Todo not found",
      });
    }

    //check ownership
    if (todoDB.username !== req.session.user.username) {
      return res.send({
        status: 401,
        message: "Not allowed to edit,authorisation failed",
      });
    }
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
    });
  }

  //Updating todo
  try {
    const todoPrev = await todoModel.findOneAndUpdate({ _id: id }, { todo });

    return res.send({
      status: 200,
      message: "Todo updated successfully",
      data: todoPrev,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

app.post("/delete-todo", isAuth, async (req, res) => {
  const { id, todo } = req.body;

  try {
    const todoDB = await todoModel.findOne({ _id: id });

    if (!id) {
      return res.send({
        status: 500,
        message: "Missing credentials",
      });
    }

    if (todoDB.username !== req.session.user.username) {
      return res.send({
        status: 401,
        message: "Not allowed to delete,authorisation failed",
      });
    }

    //delete todo from db
    const todoPrev = await todoModel.findOneAndDelete({ _id: id });

    return res.send({
      status: 200,
      message: "Todo deleted successfully",
      data: todoPrev,
    });
  } catch (error) {
    console.log("error from delete", error);
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

//pagination

app.get("/read-todos", isAuth, async (req, res) => {
  const SKIP = req.query.skip || 0;
  const LIMIT = process.env.LIMIT;
  const username = req.session.user.username;
  try {
    const todoDb = await todoModel.aggregate([
      //pagination and match
      {
        $match: { username: username },
      },
      {
        $facet: {
          data: [{ $skip: parseInt(SKIP) }, { $limit: parseInt(LIMIT) }],
        },
      },
    ]);

    return res.send({
      status: 200,
      message: "Read success",
      data: todoDb[0].data,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});


app.post("/logout", isAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;

    return res.send({
      status: 200,
      message: "Logout successfully",
    });
  });
});

app.post("/logout_from_all_devices", isAuth, async (req, res) => {
  const username = req.session.user.username;

  try {
    const deleteCount = await sessionModel.deleteMany({
      "session.user.username": username,
    });

    console.log("deleteCount", deleteCount);
    return res.send("Logged out from all devices successfully");
  } catch (error) {
    return res.send("Logout unsuccessful");
  }
});

app.listen(PORT, () => {
  console.log(clc.blue(`Server listening on port ${PORT}`));
  console.log(clc.underline(`http://localhost:${PORT}/register`));
});
