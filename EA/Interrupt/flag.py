# EA/Interrupt/flag.py

import os
import csv
from flask import session

# Define the path for the CSV file
# flag_csv_file = os.path.join('static', 'files', 'stop_flag_status.csv')
flag_csv_file = os.path.join('static', 'files', 'stop_flag_status.csv')


def write_stop_flag_to_csv(login_pin, flag):
    # Read the existing data from the CSV
    existing_data = []
    try:
        with open(flag_csv_file, mode='r') as csvfile:
            reader = csv.DictReader(csvfile)
            existing_data = [row for row in reader]
    except FileNotFoundError:
        pass

    # Update the stop flag for the given login pin
    updated = False
    for row in existing_data:
        if row['login_pin'] == login_pin:
            row['stop_flag'] = flag
            updated = True
            break

    # If the login pin was not found, add a new row
    if not updated:
        existing_data.append({'login_pin': login_pin, 'stop_flag': flag})

    # Write the updated data back to the CSV
    with open(flag_csv_file, mode='w', newline='') as csvfile:
        fieldnames = ['login_pin', 'stop_flag']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(existing_data)


# Helper function to read stop flag status from CSV
def read_stop_flag_from_csv(login_pin):
    try:
        with open(flag_csv_file, mode='r') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                if row['login_pin'] == login_pin:
                    return row['stop_flag']
    except FileNotFoundError:
        return 'False'
    return 'False'


def check_stop_flag():
    login_pin = session.get('login_pin')
    return read_stop_flag_from_csv(login_pin) == 'True'
