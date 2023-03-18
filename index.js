var express = require("express");
var ejs = require("ejs");
var bodyparser = require("body-parser");
var connection = require("./database");
var app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyparser.urlencoded({ extended: true }));

var isAuthenticated = false;
var user = {
  email: "",
  name: "",
};
//var wrongUser = false;
//app.use(express.static(__dirname+ './public'));

app.get("/login", function (req, res) {
  isAuthenticated = false;
  res.render("login", { wrongUser: false });
});

app.get("/logout", (req, res) => {
  isAuthenticated = false;
  res.redirect("/login");
});

// app.get('/subjects', function(req, res){
//     if(isAuthenticated){
//         res.redirect("/subjects");
//     }
//     else{
//         res.redirect("/login");
//     }

// });

app.post("/login", function (req, res) {
  role = req.body.role;
  var login_username = req.body.loginUsername;
  var login_password = req.body.loginPassword;
  console.log(login_username);
  console.log(login_password);
  let check_user;

  if (role == "student") {
    check_user = "select * from student where email = ? and password = ?";
  } else if (role == "teacher") {
    check_user = "select * from teacher where email = ? and password = ?";
  } else if (role == "admin") {
    check_user = "select * from admin where email = ? and password = ?";
  }

  connection.query(
    check_user,
    [login_username, login_password],
    function (err, results, fields) {
      if (err) throw err;
      console.log(results[0].first_name + " " + results[0].first_name);
      if (results.length > 0 && role == "student") {
        isAuthenticated = true;
        user.email = login_username;
        user.name = results[0].first_name + " " + results[0].last_name;
        user.job = results[0].stu_id;
        res.redirect("/student");
      } else if (results.length > 0 && role == "teacher") {
        isAuthenticated = true;
        user.email = login_username;
        user.name = results[0].first_name + " " + results[0].last_name;
        user.job = "Assistant Teacher";
        res.redirect("/teacher");
      } else if (results.length > 0 && role == "admin") {
        isAuthenticated = true;
        user.email = login_username;
        user.name = results[0].first_name + " " + results[0].last_name;
        user.job = "Admin";
        const initials =
          "select concat((left(first_name , 1)),(left(last_name,1))) as init from admin where email = ?";
        connection.query(
          initials,
          [user.email],
          function (err, results, fields) {
            if (err) throw err;
            console.log(user.email);
            user.init = results[0].init;
          }
        );
        res.redirect("/addstudent");
      } else {
        //wrongUser = true;
        console.log("incorrect Username or password.");
        res.render("login", { wrongUser: true });
      }
    }
  );
});

app.get("/viewstudent", function (req, res) {
  //results;
  let view_data = "select * from student";

  connection.query(view_data, function (err, results, fields) {
    if (err) throw err;
    console.log("result length is " + results.length);
    console.log("result is " + results);
    if (results.length > 0) {
      res.render("viewstudent", {
        initials: user.init,
        fullName: user.name,
        job: user.job,
        student: results,
        success: true,
      });
    } else {
      res.render("viewstudent", {
        initials: user.init,
        fullName: user.name,
        job: user.job,
        student: results[0],
        success: false,
      });
    }
  });

  //res.render("addstudent",{initials : results[0].init});
});

app.post("/viewstudent/:stu_id", (req, res) => {
  const stu_id = req.body.rollNo;
  console.log("id is " + stu_id);

  let search_student = "select * from student where stu_id = ?";
  connection.query(search_student, [stu_id], (err, results1) => {
    let passing_yr = results1[0].passing_year;
    // console.log(passing_yr);
    // console.log("birthdate is "+results[0].birth_date);
    let sem = currentSemester(passing_yr);
    if (err) throw err;
    let birthdate =
      "SELECT DATE_FORMAT(birth_date, '%d-%m-%Y') AS date FROM student where stu_id = ?";
    connection.query(birthdate, [stu_id], (err, results2) => {
      if (err) throw err;
      let date = results2[0].date;
      console.log(date);

      const initials =
        "select concat((left(first_name , 1)),(left(last_name,1))) as init from student where stu_id = ?";
      connection.query(initials, [stu_id], function (err, results3, fields) {
        if (err) throw err;
        let init = results3[0].init;
        res.render("card", {
          student: results1,
          initials: user.init,
          fullName: user.name,
          job: user.job,
          semester: sem,
          birth_date: date,
          init: init,
        });
      });
    });
  });
});

app.get("/addstudent", function (req, res) {
  //results;
  res.render("addstudent", {
    initials: user.init,
    fullName: user.name,
    job: user.job,
    success: false,
    added: false,
  });
  //res.render("addstudent",{initials : results[0].init});
});

app.post("/addstudent", function (req, res) {
  var newstudent = {
    stu_id: req.body.rollNo,
    email: req.body.email,
    first_name: req.body.firstName,
    last_name: req.body.lastName,
    gender: req.body.gender,
    passing_year: req.body.passingyear,
    birth_date: req.body.birthdate,
    password: req.body.password,
  };

  console.log(newstudent);

  let check_student = "select * from student where stu_id = ? or email = ?";
  connection.query(
    check_student,
    [newstudent.stu_id, newstudent.email],
    function (err, results) {
      if (err) throw err;
      console.log(results);
      if (results.length > 0) {
        res.render("addstudent", {
          initials: user.init,
          fullName: user.name,
          job: user.job,
          success: false,
          added: true,
        });
      } else {
        let insert_data = "insert into student set ?";
        connection.query(insert_data, newstudent, function (err, results) {
          if (err) throw err;
          console.log(results);
          res.render("addstudent", {
            initials: user.init,
            fullName: user.name,
            job: user.job,
            success: true,
            added: true,
          });
        });
      }
    }
  );
});

app.get("/updatestudent", (req, res) => {
  res.render("updatestudent", {
    student: "",
    initials: user.init,
    fullName: user.name,
    job: user.job,
    success: false,
    updated: false,
  });
});

app.post("/updatestudent", (req, res) => {
  const stu_id = req.body.rollNo;

  // Query the database for the student record with the given ID
  connection.query(
    `SELECT * FROM student WHERE stu_id= ?`,
    [stu_id],
    (err, results) => {
      if (err) throw err;

      // If the student record is found, display the update form
      if (results.length > 0) {
        res.render("updatestudent", {
          student: results[0],
          initials: user.init,
          fullName: user.name,
          job: user.job,
          success: true,
          updated: false,
        });
      } else {
        res.render("updatestudent", {
          student: "",
          initials: user.init,
          fullName: user.name,
          job: user.job,
          success: false,
          updated: true,
        });
      }
    }
  );
});

app.post("/updatestudent/:stu_id", (req, res) => {
  const stu_id = req.params.rollNo;
  var student = {
    email: req.body.email,
    first_name: req.body.firstName,
    last_name: req.body.lastName,
    gender: req.body.gender,
    passing_year: req.body.passingyear,
    birth_date: req.body.birthdate,
  };

  // Update the student record in the database
  let q = "UPDATE student SET ? WHERE stu_id=?";
  connection.query(q, [student, stu_id], (err, results) => {
    if (err) throw err;
    res.render("updatestudent", {
      student: "",
      initials: user.init,
      fullName: user.name,
      job: user.job,
      success: true,
      updated: true,
    });

    //res.send(`Student with ID ${id} has been updated.`);
  });
});

app.get("/deletestudent", function (req, res) {
  //results;
  res.render("deletestudent", {
    initials: user.init,
    fullName: user.name,
    job: user.job,
    success: false,
  });
  //res.render("addstudent",{initials : results[0].init});
});

app.post("/deletestudent", function (req, res) {
  stu_id = req.body.rollNo;
  let delete_data = "delete from student where stu_id = ?";
  connection.query(delete_data, [stu_id], function (err, results) {
    if (err) throw err;
    console.log(results);
    res.render("deletestudent", {
      initials: user.init,
      fullName: user.name,
      job: user.job,
      success: true,
    });
  });
});

// app.post('/student', function(req,res){
//     isAuthenticated = false;
//     res.redirect("/login");
// });

// function check_authentication(req, res, next){
//     if(req.isAuthenticated()){
//         return next();
//     }
//     res.redirect('/login');
// };

function currentSemester(passing_yr) {
  const date = new Date();
  current_yr = date.getFullYear();
  current_month = date.getMonth();
  if (current_month < 6) sem = 8 - (passing_yr - current_yr) * 2;
  else sem = 8 - (passing_yr - current_yr);
  return sem;
}

app.listen(3300, function () {
  console.log("App Listening");
  connection.connect(function (err) {
    if (err) throw err;
    console.log("Database Connected!");
  });
});
