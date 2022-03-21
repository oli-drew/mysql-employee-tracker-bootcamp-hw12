// Bring in required modules
const inquirer = require("inquirer");
// const fs = require("fs");
const chalk = require("chalk");
const figlet = require("figlet");
// Import and require mysql2
const mysql = require("mysql2");

// Connect to the database
const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "password",
    database: "company_db",
  },
  console.log(`Connected to the company_db database.`)
);

// Exit application
const exitGenerator = (message) => {
  console.log(
    chalk.yellow(
      figlet.textSync(message, {
        font: "Small",
        horizontalLayout: "default",
        verticalLayout: "default",
      })
    )
  );
};

// Ask the user if they would like to start or exit
const startGenerator = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "start",
        message: "Shall we start organising your employees?",
        choices: ["Yes, Please!", "No, thank you!"],
      },
    ])
    .then((data) => {
      const answer = data.start;
      if (answer === "Yes, Please!") {
        console.log(chalk.green.bold("Okay, let's do this!", "\n"));
        // Start asking questions
        init();
      } else {
        exitGenerator("Bye Bye!");
      }
    });
};

// Introduce Application
const applicationIntro = () => {
  console.log(
    chalk.green(
      figlet.textSync("Employee Tracker", {
        font: "Standard",
        horizontalLayout: "default",
        verticalLayout: "default",
      })
    )
  );
  console.log(
    chalk.bgGreen.bold.white(
      "------- View and manage the departments, roles, and employees in a company -------",
      "\n"
    )
  );
  startGenerator();
};

applicationIntro();

// Do stuff here
const init = () => {
  // console.log("let's go!!!");
  mainMenu();
};

// Main Menu
const mainMenu = () => {
  return inquirer.prompt([
    {
      type: "list",
      name: "mainOptions",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Update an employee role",
        "Exit",
      ],
      message: "How can I help?",
    },
  ]);
};

// View all departments
const viewDepartments = () => {
  //
};

// View all roles
const viewRoles = () => {
  //
};

// View all employees
const viewEmployees = () => {
  //
};

// Add a department
const addDepartment = () => {
  //
};

// Add a role
const addRole = () => {
  //
};

// Add employee
const addEmployee = () => {
  //
};

// Update an employee role
const updateEmployeeRole = () => {
  //
};

// Update employee manager

// View employees by manager

// Delete department

// Delete role

// Delete employee

// View total utilized budget of a department

//
// Query database
// db.query("SELECT * FROM department", function (err, results) {
//   console.log(results);
// });

// // Query database
// db.query("SELECT * FROM role", function (err, results) {
//   console.log(results);
// });

// // Query database
// db.query("SELECT * FROM employee", function (err, results) {
//   console.log(results);
// });
