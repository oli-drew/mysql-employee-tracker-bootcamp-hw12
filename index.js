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
  mainMenu();
};

// Open main menu
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
        "View budget",
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
  } else if (answer === "View budget") {
    utilisedBudget();
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

// Add a role
const addRole = () => {
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
        choices: createDepartmentArray(),
        message: "Please assign the role to a department",
      },
    ])
    .then((answers) => {
      let departmentId = answers.department.split(":")[0];
      createRole(answers.name, answers.salary, departmentId);
    });
};

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
        choices: createEmployeeArray(),
      },
    ])
    .then((answers) => {
      // Role ID
      let roleId = answers.role.split(":")[0];
      // Manager ID
      let managerId = answers.manager.split(":")[0];
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

// Update an employee role
const updateEmployeeRole = async () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "confirm",
        message:
          "You are about to modify an employee's role, do you wish to continue?",
        choices: ["Yes", "No"],
      },
      {
        type: "list",
        name: "employee",
        message: "Which employee would you like to update?",
        when: (answers) => answers.confirm === "Yes",
        choices: createEmployeeArray(),
      },
      {
        type: "list",
        name: "role",
        message: "What is their new role?",
        when: (answers) => answers.confirm === "Yes",
        choices: createRoleArray(),
      },
    ])
    .then((answers) => {
      if (answers.confirm === "Yes") {
        // Employee ID
        let employeeId = answers.employee.split(":")[0];
        // Role ID
        let roleId = answers.role.split(":")[0];
        updateRole(employeeId, roleId);
      } else {
        // Show main menu
        mainMenu();
      }
    });
};

// Push role change to database
function updateRole(employeeId, roleId) {
  db.query(
    `UPDATE employee SET ? WHERE ?`,
    [
      {
        role_id: roleId,
      },
      {
        id: employeeId,
      },
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      console.log(chalk.green.bold(`Updated Employee role successfully`, "\n"));
      // Show main menu
      mainMenu();
    }
  );
}

// Make array of departments
const createDepartmentArray = () => {
  const departmentArray = [];
  db.query(`SELECT * FROM department`, function (err, results) {
    results.forEach((department) => {
      departmentArray.push(`${department.id}: ${department.name}`);
    });
  });
  return departmentArray;
};

// Make array of roles
const createRoleArray = () => {
  const roleArray = [];
  db.query(`SELECT id, title FROM role`, function (err, results) {
    results.forEach((job) => {
      roleArray.push(`${job.id}: ${job.title}`);
    });
  });
  return roleArray;
};

// Make array of roles
const createEmployeeArray = () => {
  const employeeArray = [];
  db.query(`SELECT * FROM employee`, function (err, results) {
    results.forEach((employee) => {
      employeeArray.push(
        `${employee.id}: ${employee.first_name} ${employee.last_name}`
      );
    });
  });
  return employeeArray;
};

// View total utilized budget of a department or role
const utilisedBudget = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "type",
        message: "Would you like budget by Department or by Role?",
        choices: ["Department", "Role"],
      },
      {
        type: "list",
        name: "department",
        message: "Which department budget would you like to view?",
        when: (answers) => answers.type === "Department",
        choices: createDepartmentArray(),
      },
      {
        type: "list",
        name: "role",
        message: "Which role budget would you like to view?",
        when: (answers) => answers.type === "Role",
        choices: createRoleArray(),
      },
    ])
    .then((answers) => {
      if (answers.type === "Department") {
        let departmentId = answers.department.split(":")[0];
        departmentBudget(departmentId);
      } else if (answers.type === "Role") {
        let roleId = answers.role.split(":")[0];
        roleBudget(roleId);
      }
    });
};

// Department Budget
const departmentBudget = (id) => {
  db.query(
    `SELECT r.salary FROM employee e
    JOIN role r ON e.role_id = r.id
    JOIN department d ON r.department_id = d.id WHERE ?`,
    { "d.id": id },
    (err, data) => {
      if (err) throw err;
      // Calculate budget used
      let budget = 0;
      data.forEach((employee) => {
        budget += parseInt(employee.salary);
      });
      console.log(
        chalk.green.bold(`Current expenditure of this department: £${budget}`),
        "\n"
      );
      // Show main menu
      mainMenu();
    }
  );
};

// Role budget
const roleBudget = (id) => {
  db.query(
    `SELECT r.salary FROM employee e
    JOIN role r ON e.role_id = r.id WHERE ?`,
    { "r.id": id },
    (err, data) => {
      if (err) throw err;
      // Calculate budget used
      let budget = 0;
      data.forEach((employee) => {
        budget += parseInt(employee.salary);
      });
      console.log(
        chalk.green.bold(`Current expenditure for this role: £${budget}`),
        "\n"
      );
      // Show main menu
      mainMenu();
    }
  );
};
