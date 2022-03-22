USE company_db;

INSERT INTO department (name)
VALUES ("Marketing"),
       ("Sales"),
       ("IT"),
       ("Finance"),
       ("Directors"),
       ("Cutomer Services");

INSERT INTO role (title, salary, department_id)
VALUES  ("Sales Manager", 55000, 2),
        ("Customer Service", 30000, 6),
        ("Managing Director", 100000, 5),
        ("Accountant", 50000, 4),
        ("Sales Rep", 30000,2),
        ("Web Developer", 60000,3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES  ("Jeremy", "May", 1, 1),
        ("Eve", "Polastri", 3, null),
        ("Jodie", "Comer", 2, 1),
        ("Richard", "Clarkson", 5, 1),
        ("Lucy", "Loo", 4, 2),
        ("Oli", "Drew", 6, 2);