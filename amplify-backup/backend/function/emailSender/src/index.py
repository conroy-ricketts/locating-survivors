import json

import os
from email.message import EmailMessage
import pytz
# from email.mime.text import MIMEText
# from email.mime.multipart import MIMEMultipart
# import ssl
from datetime import datetime 
import time 
import random
# from decimal import Decimal 
import smtplib

TIME_LIMIT = 60 * 5 * 1 # seconds, minutes, hours


#Generates a random latitude, longitude, and uncertainty
def generate_random_location():

    # Generate random latitude (-90 to 90 degrees)
    latitude = round(random.uniform(-90, 90), 6)

    # Generate random longitude (-180 to 180 degrees)
    longitude = round(random.uniform(-180, 180), 6)

    # Generate random uncertainty (0 to 5000 meters)
    uncertainty = round(random.uniform(0, 5000), 2)

    return latitude, longitude, uncertainty

def format_phone_number(phone_number):
    if len(phone_number) == 10:
        phone_number =  phone_number[:3] + '-' + phone_number[3:6] + '-' + phone_number[6:]
    if len(phone_number) == 11:
        phone_number = phone_number[:4] + '-' + phone_number[4:7] + '-' + phone_number[7:]
    return phone_number


# Store latitude, longitude and uncertainty
latitude, longitude, uncertainty = generate_random_location()

#Make sure this ID is the same as the target_case_id in the emailScraper
def send_email (case_id, phone_number, name, updated_time):
    id = case_id
    new_time = updated_time
    #These can be changed as you see fit for your own testing until integration with ECR Builder page
    name = name 
    phone_number = format_phone_number(phone_number)


    #Sender and Reciver emails. These do not need to be changed.
    sender_email = 'locatingsurvivorssender@gmail.com'
    email_password = 'vahc wmsy yjvl jjxo'
    receiver_email = f'locatingsurvivorsemailtest+{id}@gmail.com'

    # SMTP server and port for our sender email. These do not need to be changed.
    smtp_server = 'smtp.gmail.com'
    smtp_port = 465

    # Generate new latitude, longitude, and uncertainty
    latitude, longitude, uncertainty = generate_random_location()
    
    # Update the email body with new data
    subject = f"{id} ECR Data Update "
    body = f"""ID: {id}
NAME: {name}
PHONE NUMBER: {phone_number}
TIME: {updated_time}
LATITUDE: {latitude} N
LONGITUDE: {longitude} W
UNCERTAINTY: {uncertainty}
    """
    
    # Update the email content
    em = EmailMessage()
    em['From'] = sender_email
    em['To'] = receiver_email
    em['Subject'] = subject
    em.set_content(body)
    
    # Send the email
    with smtplib.SMTP_SSL(smtp_server, smtp_port) as smtp:
        smtp.login(sender_email, email_password)
        smtp.sendmail(sender_email, receiver_email, em.as_string())
    
    # Wait for 2 minutes before sending the next email
    time.sleep(5)

def handler(event, context):
  case_id = event.get("case_id")
  phone_number = event.get("phone_number")
  duration = event.get("duration", 0)
  duration_in_minutes = int(duration) * 60

  # set phone_number to a string

  phone_number = str(phone_number)
  
  name = event.get("name", "DEFAULT")
  if name == None:
      name = "DEFAULT"
  
  new_time = datetime.now(pytz.timezone('US/Eastern'))
  start_time = time.time()

  ## if duration is 0 send one email, other wise send emails every duration minutes for up to time limit
  send_email(case_id, phone_number, name, new_time)
  print("One email sent")

  
  print("Process has completed")
  return {
      'statusCode': 200,
      'headers': {
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
      },
      'body': json.dumps('SUCCESS')
      
  }