const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const User = require("./models/User");
const Todo = require("./models/Todo");

const app = express();
mongoose
  .connect(
    "mongodb+srv://jbwebdeveloper:jbsmile8@twitterclonecluster.g17zs.mongodb.net/TodoDb?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Database Connection Successful");
  })
  .catch((err) => {
    console.log(`Database Connection failed :) ${err}`);
  });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/signup", (req, res) => {
  const newUser = new User({
    username: req.body.username,
    password: bcrypt.hashSync(req.body.password, 10),
  });
  newUser.save((err) => {
    if (err) {
      return res.status(400).json({
        title: "err",
        error: "Email already in Use",
      });
    }
    return res.status(200).json({
      title: "User succesfully created ....",
    });
  });
});

app.post("/login", (req, res) => {
  User.findOne({ username: req.body.username }, (err, user) => {
    if (err)
      return res.status(500).json({
        title: "Server error",
        error: err,
      });
    if (!user)
      return res.status(400).json({
        title: "User not found",
        error: "Invalid Username or password",
      });

    if (!bcrypt.compareSync(req.body.password, user.password))
      return res.status(401).json({
        title: "Login Failed",
        error: "Invalid Username or password",
      });

    //authentication is done give them token
    let token = jwt.sign({ userId: user._id }, "secretKey");
    res.status(200).json({
      title: "Login success",
      token: token,
    });
  });
});

// const requireToken = (req, res, next) => {
//   jwt.verify(token, "secretKey", (err, decoded) => {
//     if (err)
//       return res.status(401).json({
//         title: "Not authorised",
//       });
//   });
//   next();
// };
//Get User
app.get("/user", (req, res) => {
  let token = req.headers.token;
  //verify token
  jwt.verify(token, "secretKey", (err, decoded) => {
    if (err)
      return res.status(401).json({
        title: "Not authorised",
      });
    //find user of id on dedcoded
    User.findOne({ _id: decoded.userId }, (err, user) => {
      if (err) return console.log(err);
      return res.status(200).json({
        title: "success",
        user: {
          username: user.username,
        },
      });
    });
  });
});
//Get Todos
app.get("/todos", (req, res) => {
  let token = req.headers.token;
  //verify token
  jwt.verify(token, "secretKey", (err, decoded) => {
    if (err)
      return res.status(401).json({
        title: "Not authorised",
      });
    //find user of id on dedcoded
    Todo.find({ author: decoded.userId }, (err, todos) => {
      if (err) return console.log(err);
      return res.status(200).json({
        title: "success",
        todos: todos,
      });
    });
  });
});
//Create Todos
app.post("/todos", (req, res) => {
  let token = req.headers.token;
  //verify token
  jwt.verify(token, "secretKey", (err, decoded) => {
    if (err)
      return res.status(401).json({
        title: "Not authorised",
      });

    //create a todo
    let newTodo = new Todo({
      title: req.body.title,
      description: req.body.description,
      isCompleted: false,
      isReminder: false,
      isAchieved: false,
      author: decoded.userId,
    });
    newTodo.save((error) => {
      if (error) console.log(error);
      res.status(200).json({
        title: "Todo Created Successfully",
        todo: newTodo,
      });
    });
  });
});

//Mark as completed
app.put("/todo/:todoId", (req, res) => {
  let token = req.headers.token;
  //verify token
  jwt.verify(token, "secretKey", (err, decoded) => {
    if (err)
      return res.status(401).json({
        title: "Not authorised",
      });
    //find Todo of id on dedcoded
    Todo.findOne(
      { auther: decoded.userId, _id: req.params.todoId },
      (err, todo) => {
        if (err) return console.log(err);
        todo.isCompleted = true;
        todo.save((error) => {
          if (error) return console.log(err);
          return res.status(200).json({
            title: "success",
            todo: todo,
          });
        });
      }
    );
  });
});
const port = process.env.PORT || 5000;

app.listen(port, (err) => {
  if (err) return console.log(err);
  console.log(`Server running at port ${port}`);
});
