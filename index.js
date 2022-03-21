// Bring in required modules
const inquirer = require("inquirer");
// const fs = require("fs");
const chalk = require("chalk");
const figlet = require("figlet");
// Import and require mysql2
const mysql = require("mysql2");
// Console Tables
const cTable = require("console.table");

// Require classes
const Department = require("./lib/Department");
const Role = require("./lib/Role");
const Employee = require("./lib/Employee");

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
  process.exit();
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

//
const mainMenu = () => {
  menuQuestions()
    .then(menuResponse)
    .catch((err) => console.error(err));
};

// Main Menu questions
const menuQuestions = () => {
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
      message: chalk.bgGreen.bold.white("Main menu:"),
    },
  ]);
};

// Main menu user request
function menuResponse(answers) {
  const answer = answers.mainOptions;
  if (answer === "View all departments") {
    viewDepartments();
  } else if (answer === "View all roles") {
    viewRoles();
  } else if (answer === "View all employees") {
    viewEmployees();
  } else if (answer === "Add a department") {
    addDepartment();
  } else if (answer === "Add a role") {
    addRole();
  } else if (answer === "Add an employee") {
    addEmployee();
  } else if (answer === "Update an employee role") {
    updateEmployeeRole();
  } else exitGenerator("See you soon!");
}

// View all departments
const viewDepartments = () => {
  console.log(chalk.green.bold("All Departments:", "\n"));
  // Query all records in department table
  db.query(`SELECT * FROM department`, function (err, results) {
    console.table(results);
    // Show main menu
    mainMenu();
  });
};

// View all roles
const viewRoles = () => {
  console.log(chalk.green.bold("All Roles:", "\n"));
  // Query all records in role table
  db.query(
    `SELECT role.id, title, salary, department.name AS department
  FROM role 
  JOIN department ON role.department_id = department.id`,
    function (err, results) {
      console.table(results);
      // Show main menu
      mainMenu();
    }
  );
};

// View all employees
const viewEmployees = () => {
  console.log(chalk.green.bold("All Employees:", "\n"));
  // Query all records in employee table
  db.query(
    `SELECT em.id, em.first_name, em.last_name, role.title, role.salary, department.name AS department,CONCAT(man.first_name, ' ', man.last_name) AS manager
    FROM employee em
    LEFT JOIN role ON em.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee man ON em.manager_id = man.id`,
    function (err, results) {
      console.table(results);
      // Show main menu
      mainMenu();
    }
  );
};

// Add a department
const addDepartment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "What is the new department called?",
      },
    ])
    .then((answers) => {
      createDepartment(answers.name);
    });
};

// Create a new department in the database
const createDepartment = (name) => {
  db.query(
    "INSERT INTO department SET ?",
    new Department(name),
    (err, result) => {
      if (err) {
        console.log(err);
      }
      console.log(chalk.green.bold(`Department called ${name} created`, "\n"));
      // Show main menu
      mainMenu();
    }
  );
};

// // Make an array of departments
// const departmentArr = () => {
//   let departmentsArray = [];
//   db.query(`SELECT * FROM department`, function (err, results) {
//     departmentsArray = results.map((department) => ({
//       name: department.name,
//       id: department.id,
//     }));
//     return departmentsArray;
//   });
// };

// Add a role
const addRole = () => {
  // Get the departments
  let departmentsArray = [];
  db.query(`SELECT * FROM department`, function (err, results) {
    departmentsArray = results.map((department) => ({
      name: department.name,
      id: department.id,
    }));
    // Prompt user
    inquirer
      .prompt([
        {
          type: "input",
          name: "name",
          message: "Please enter the name of the role:",
        },
        {
          type: "input",
          name: "salary",
          message: "Please enter a salary:",
        },
        {
          type: "list",
          name: "department",
          choices: departmentsArray,
          message: "Please assign the role to a department",
        },
      ])
      .then((answers) => {
        let departmentId = 0;
        departmentsArray.forEach((dept) => {
          if (answers.department === dept.name) {
            departmentId = dept.id;
          }
        });
        createRole(answers.name, answers.salary, departmentId);
      });
  });
};

// Department ID from name
// const departmentID = (deptName, deptArr) => {
//   deptArr.forEach((dept) => {
//     if (deptName === dept.name) {
//       return dept.id;
//     }
//   });
// };

// Create a new role in the database
const createRole = (name, salary, department) => {
  db.query(
    "INSERT INTO role SET ?",
    new Role(name, salary, department),
    (err, result) => {
      if (err) {
        console.log(err);
      }
      console.log(chalk.green.bold(`Role called ${name} created`, "\n"));
      // Show main menu
      mainMenu();
    }
  );
};

// Add employee
const addEmployee = () => {
  //
  inquirer
    .prompt([
      {
        type: "input",
        name: "firstName",
        message: "Please enter the employee's first name:",
      },
      {
        type: "input",
        name: "lastName",
        message: "Please enter the employee's last name:",
      },
      {
        type: "list",
        name: "role",
        message: "What is the employee's role?",
        choices: createRoleArray(),
      },
      {
        type: "list",
        name: "manager",
        message: "Who is the employee's manager?",
        choices: createManagerArray(),
      },
    ])
    .then((answers) => {
      // Role ID
      let roleId = 1;
      // let rolesArr = createRoleArray();
      // console.log(rolesArr);
      // rolesArr.forEach((role) => {
      //   if (answers.role === role.title) {
      //     roleId = role.id;
      //   }
      // });
      // Manager ID
      let managerId = 1;
      let managerArr = createManagerArray();
      // managerArr.forEach((manager) => {
      //   if (answers.manager === `${manager.first_name} ${manager.last_name}`) {
      //     managerId = manager.id;
      //   }
      // });
      createEmployee(answers.firstName, answers.lastName, roleId, managerId);
    });
};

// Create a new role in the database
const createEmployee = (first_name, last_name, role_id, manager_id) => {
  db.query(
    "INSERT INTO employee SET ?",
    new Employee(first_name, last_name, role_id, manager_id),
    (err, result) => {
      if (err) {
        console.log(err);
      }
      console.log(
        chalk.green.bold(
          `Employee called ${first_name} ${last_name} created`,
          "\n"
        )
      );
      // Show main menu
      mainMenu();
    }
  );
};

// // Make array of roles
// const createDepartmentArray = () => {
//   const departmentArray = [];
//   db.query(`SELECT * FROM department`, function (err, results) {
//     departmentsArray = results.map((department) => ({
//       name: department.name,
//       id: department.id,
//     }));
//   });
//   return departmentArray;
// };

// Make array of roles
const createRoleArray = () => {
  const roleArray = [];
  db.query(`SELECT id, title FROM role`, function (err, results) {
    results.forEach((job) => {
      roleArray.push(job.title);
    });
  });
  return roleArray;
};

// Make array of roles
const createManagerArray = () => {
  const managerArray = [];
  db.query(`SELECT * FROM employee`, function (err, results) {
    results.forEach((employee) => {
      managerArray.push(`${employee.first_name} ${employee.last_name}`);
    });
  });
  return managerArray;
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
