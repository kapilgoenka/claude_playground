# PROMPT:
#
# Let's work on a new file, called employees_sql.py. We'll write several SQL
# queries in it on a table called "employees". I expect we'll have several
# functions, each containing a SQL query. When the python script is run, all
# functions should be run. For the employees tables, create a MySQL db called
# "employees_sql" with an "employees" table in it. The table should have the
# columns name, email, department, hire_date and salary. Create 1000 rows with
# test data in the table to work with.
#
# Write a function containing a SQL query that selects and prints all columns
# from the employees table.
#
# Write another function that selects only the name and email columns.
#
# There is a lot of shared, boilerplate type code in the two select*
# functions. Can you extract it out so that it is not repeated?
#
# Next, write a function that prints only the employees from the Engineering
# department
#
# Next, write a function that prints only the employees from either
# Engineering or IT department
#
# Write a function that does the same thing as the last one, but orders the
# result by hire date, oldest first.
#
# Similar to the last function, write a new one that orders alpahbetically bu
# employee name.
#
# For each SQL query, explain (print) in plain english what the query does.
#
# Pleas update the file for line length.
#
# Write a function to print the number of employees in each department.
#
# Write a function to print the top five longest-serving employees.
#
# Write a function to print the average salary for each department
#
# Dedupe the boilerplate code in create_database_and_table and
# populate_test_data functions.
#
# reorder the functiions such that all the helper functions are in one place.
#
# Fix this error: ModuleNotFoundError: No module named 'mysql'
#
# Update the script so that it always recreates the employees table when run.
# And instead of 1000 employees, lets work with 250.
#

import mysql.connector
from mysql.connector import Error
import random
from datetime import datetime, timedelta


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_db_connection_without_database():
    """
    Creates and returns a MySQL server connection without specifying a
    database.
    """
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='12345678'  # Update with your MySQL password
    )


def get_db_connection():
    """
    Creates and returns a database connection.
    """
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='12345678',  # Update with your MySQL password
        database='employees_sql'
    )


def execute_query(query):
    """
    Executes a SQL query and returns the results.
    """
    try:
        connection = get_db_connection()
        if connection.is_connected():
            cursor = connection.cursor()
            cursor.execute(query)
            results = cursor.fetchall()
            cursor.close()
            connection.close()
            return results
    except Error as e:
        print(f"Error: {e}")
        return []


def print_table_header(title, columns):
    """
    Prints a formatted table header.
    """
    print("\n" + "="*88)
    print(title)
    print("="*88)
    print(columns)
    print("-"*88)


# ============================================================================
# SETUP FUNCTIONS
# ============================================================================

def create_database_and_table():
    """
    Creates the employees_sql database and recreates the employees table.
    """
    try:
        connection = get_db_connection_without_database()

        if connection.is_connected():
            cursor = connection.cursor()

            # Create database
            cursor.execute("CREATE DATABASE IF NOT EXISTS employees_sql")
            print("Database 'employees_sql' created successfully")

            # Use the database
            cursor.execute("USE employees_sql")

            # Drop existing table if it exists
            cursor.execute("DROP TABLE IF EXISTS employees")
            print("Dropped existing employees table")

            # Create employees table
            create_table_query = """
            CREATE TABLE employees (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                department VARCHAR(50) NOT NULL,
                hire_date DATE NOT NULL,
                salary DECIMAL(10, 2) NOT NULL
            )
            """
            cursor.execute(create_table_query)
            print("Table 'employees' created successfully")

            connection.commit()
            cursor.close()
            connection.close()

    except Error as e:
        print(f"Error: {e}")


def populate_test_data():
    """
    Populates the employees table with 250 rows of test data.
    """
    try:
        connection = get_db_connection()

        if connection.is_connected():
            cursor = connection.cursor()

            # Sample data
            first_names = [
                "Amit", "Priya", "Raj", "Anjali", "Vikram", "Sneha",
                "Arjun", "Pooja", "Rohan", "Kavya", "Aditya", "Riya",
                "Karan", "Neha", "Siddharth", "Divya", "Rahul", "Meera",
                "Nikhil", "Shruti"
            ]
            last_names = [
                "Sharma", "Patel", "Singh", "Kumar", "Gupta", "Verma",
                "Reddy", "Iyer", "Nair", "Chopra", "Kapoor", "Menon",
                "Desai", "Joshi", "Shah", "Rao", "Bhat", "Agarwal",
                "Mishra", "Pandey"
            ]
            departments = [
                "Engineering", "Sales", "Marketing", "HR", "Finance",
                "Operations", "IT", "Customer Support"
            ]

            # Generate 250 rows
            insert_query = """
            INSERT INTO employees (name, email, department, hire_date, salary)
            VALUES (%s, %s, %s, %s, %s)
            """

            data = []
            for i in range(250):
                first_name = random.choice(first_names)
                last_name = random.choice(last_names)
                name = f"{first_name} {last_name}"
                email = f"{first_name.lower()}.{last_name.lower()}{i}@company.com"
                department = random.choice(departments)

                # Random hire date between 2015 and 2024
                start_date = datetime(2015, 1, 1)
                end_date = datetime(2024, 12, 31)
                time_between = end_date - start_date
                random_days = random.randrange(time_between.days)
                hire_date = start_date + timedelta(days=random_days)

                # Random salary between 30000 and 150000
                salary = round(random.uniform(30000, 150000), 2)

                data.append((name, email, department, hire_date, salary))

            cursor.executemany(insert_query, data)
            connection.commit()
            print(f"Successfully inserted 250 rows into employees table")

            cursor.close()
            connection.close()

    except Error as e:
        print(f"Error: {e}")


# ============================================================================
# QUERY FUNCTIONS
# ============================================================================

def select_all_employees():
    """
    Selects and prints all columns from the employees table.
    """
    query = "SELECT * FROM employees"
    print("\nQuery explanation: Select all columns from all employees")
    results = execute_query(query)

    print_table_header(
        "ALL EMPLOYEES",
        f"{'ID':<5} {'Name':<20} {'Email':<30} {'Department':<15} "
        f"{'Hire Date':<12} {'Salary':<10}"
    )

    for row in results:
        print(
            f"{row[0]:<5} {row[1]:<20} {row[2]:<30} {row[3]:<15} "
            f"{str(row[4]):<12} ${row[5]:>9,.2f}"
        )

    print(f"\nTotal employees: {len(results)}")


def select_name_email():
    """
    Selects and prints only the name and email columns from the employees
    table.
    """
    query = "SELECT name, email FROM employees"
    print(
        "\nQuery explanation: Select only the name and email columns from "
        "all employees"
    )
    results = execute_query(query)

    print_table_header(
        "EMPLOYEE NAMES AND EMAILS",
        f"{'Name':<30} {'Email':<58}"
    )

    for row in results:
        print(f"{row[0]:<30} {row[1]:<58}")

    print(f"\nTotal employees: {len(results)}")


def select_engineering_employees():
    """
    Selects and prints only employees from the Engineering department.
    """
    query = "SELECT * FROM employees WHERE department = 'Engineering'"
    print(
        "\nQuery explanation: Select all columns from employees who work "
        "in the Engineering department"
    )
    results = execute_query(query)

    print_table_header(
        "ENGINEERING DEPARTMENT EMPLOYEES",
        f"{'ID':<5} {'Name':<20} {'Email':<30} {'Department':<15} "
        f"{'Hire Date':<12} {'Salary':<10}"
    )

    for row in results:
        print(
            f"{row[0]:<5} {row[1]:<20} {row[2]:<30} {row[3]:<15} "
            f"{str(row[4]):<12} ${row[5]:>9,.2f}"
        )

    print(f"\nTotal Engineering employees: {len(results)}")


def select_engineering_or_it_employees():
    """
    Selects and prints only employees from either Engineering or IT
    departments.
    """
    query = """
    SELECT * FROM employees
    WHERE department = 'Engineering' OR department = 'IT'
    """
    print(
        "\nQuery explanation: Select all columns from employees who work "
        "in either the Engineering or IT department"
    )
    results = execute_query(query)

    print_table_header(
        "ENGINEERING OR IT DEPARTMENT EMPLOYEES",
        f"{'ID':<5} {'Name':<20} {'Email':<30} {'Department':<15} "
        f"{'Hire Date':<12} {'Salary':<10}"
    )

    for row in results:
        print(
            f"{row[0]:<5} {row[1]:<20} {row[2]:<30} {row[3]:<15} "
            f"{str(row[4]):<12} ${row[5]:>9,.2f}"
        )

    print(f"\nTotal Engineering or IT employees: {len(results)}")


def select_engineering_or_it_ordered_by_hire_date():
    """
    Selects and prints only employees from either Engineering or IT
    departments, ordered by hire date (oldest first).
    """
    query = """
    SELECT * FROM employees
    WHERE department = 'Engineering' OR department = 'IT'
    ORDER BY hire_date ASC
    """
    print(
        "\nQuery explanation: Select all columns from employees in "
        "Engineering or IT, sorted by hire date with oldest employees first"
    )
    results = execute_query(query)

    print_table_header(
        "ENGINEERING OR IT EMPLOYEES - ORDERED BY HIRE DATE (OLDEST FIRST)",
        f"{'ID':<5} {'Name':<20} {'Email':<30} {'Department':<15} "
        f"{'Hire Date':<12} {'Salary':<10}"
    )

    for row in results:
        print(
            f"{row[0]:<5} {row[1]:<20} {row[2]:<30} {row[3]:<15} "
            f"{str(row[4]):<12} ${row[5]:>9,.2f}"
        )

    print(f"\nTotal Engineering or IT employees: {len(results)}")


def select_engineering_or_it_ordered_by_name():
    """
    Selects and prints only employees from either Engineering or IT
    departments, ordered alphabetically by employee name.
    """
    query = """
    SELECT * FROM employees
    WHERE department = 'Engineering' OR department = 'IT'
    ORDER BY name ASC
    """
    print(
        "\nQuery explanation: Select all columns from employees in "
        "Engineering or IT, sorted alphabetically by employee name"
    )
    results = execute_query(query)

    print_table_header(
        "ENGINEERING OR IT EMPLOYEES - ORDERED ALPHABETICALLY BY NAME",
        f"{'ID':<5} {'Name':<20} {'Email':<30} {'Department':<15} "
        f"{'Hire Date':<12} {'Salary':<10}"
    )

    for row in results:
        print(
            f"{row[0]:<5} {row[1]:<20} {row[2]:<30} {row[3]:<15} "
            f"{str(row[4]):<12} ${row[5]:>9,.2f}"
        )

    print(f"\nTotal Engineering or IT employees: {len(results)}")


def count_employees_by_department():
    """
    Counts and prints the number of employees in each department.
    """
    query = """
    SELECT department, COUNT(*) as employee_count
    FROM employees
    GROUP BY department
    ORDER BY employee_count DESC
    """
    print(
        "\nQuery explanation: Count the number of employees in each "
        "department and sort by count in descending order"
    )
    results = execute_query(query)

    print_table_header(
        "EMPLOYEE COUNT BY DEPARTMENT",
        f"{'Department':<30} {'Employee Count':<20}"
    )

    total = 0
    for row in results:
        print(f"{row[0]:<30} {row[1]:<20}")
        total += row[1]

    print(f"\nTotal employees across all departments: {total}")


def select_top_five_longest_serving():
    """
    Selects and prints the top five longest-serving employees.
    """
    query = """
    SELECT * FROM employees
    ORDER BY hire_date ASC
    LIMIT 5
    """
    print(
        "\nQuery explanation: Select the top five employees with the "
        "earliest hire dates (longest-serving)"
    )
    results = execute_query(query)

    print_table_header(
        "TOP FIVE LONGEST-SERVING EMPLOYEES",
        f"{'ID':<5} {'Name':<20} {'Email':<30} {'Department':<15} "
        f"{'Hire Date':<12} {'Salary':<10}"
    )

    for row in results:
        print(
            f"{row[0]:<5} {row[1]:<20} {row[2]:<30} {row[3]:<15} "
            f"{str(row[4]):<12} ${row[5]:>9,.2f}"
        )

    print(f"\nShowing top {len(results)} longest-serving employees")


def average_salary_by_department():
    """
    Calculates and prints the average salary for each department.
    """
    query = """
    SELECT department, AVG(salary) as avg_salary
    FROM employees
    GROUP BY department
    ORDER BY avg_salary DESC
    """
    print(
        "\nQuery explanation: Calculate the average salary for each "
        "department and sort by average salary in descending order"
    )
    results = execute_query(query)

    print_table_header(
        "AVERAGE SALARY BY DEPARTMENT",
        f"{'Department':<30} {'Average Salary':<20}"
    )

    for row in results:
        print(f"{row[0]:<30} ${row[1]:>18,.2f}")

    print(f"\nShowing average salaries for {len(results)} departments")


if __name__ == "__main__":
    print("Setting up employees_sql database...")
    create_database_and_table()
    populate_test_data()
    print("Setup complete!")
    print("\n" + "="*88)
    print("RUNNING SQL QUERIES")
    print("="*88)
    select_all_employees()
    select_name_email()
    select_engineering_employees()
    select_engineering_or_it_employees()
    select_engineering_or_it_ordered_by_hire_date()
    select_engineering_or_it_ordered_by_name()
    count_employees_by_department()
    select_top_five_longest_serving()
    average_salary_by_department()
