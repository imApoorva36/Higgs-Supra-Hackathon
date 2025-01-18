import random
import string
import lgpio
from mfrc522 import SimpleMFRC522
from gpiozero import AngularServo
from time import sleep
import os
import requests

load_dotenv()

def createRandomKey():
    return ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(8))

def readTag():
    CHIP = 0
    h = lgpio.gpiochip_open(CHIP)
    pin_rst = 25
    lgpio.gpio_claim_output(h, pin_rst)
    reader = SimpleMFRC522()
    try:
        id, text = reader.read()
        return {id, text}
    finally:
            # Release the GPIO pin and close the chip
            lgpio.gpio_free(h, pin_rst)
            lgpio.gpiochip_close(h)

def writeTag(code):
    CHIP = 0
    h = lgpio.gpiochip_open(CHIP)
    pin_rst = 25
    lgpio.gpio_claim_output(h, pin_rst)
    reader = SimpleMFRC522()
        # Ensure code is a multiple of 16 bytes
    try:
        if len(code) < 16:
            code = code.ljust(16)
        elif len(code) > 16:
            code = code[:16]
        reader.write(code)
        return {code}
    finally:
        # Release the GPIO pin and close the chip
        lgpio.gpio_free(h, pin_rst)
        lgpio.gpiochip_close(h)

def servo(duration):
    servo = AngularServo(18, min_pulse_width=0.0006, max_pulse_width=0.0023)
    servo.angle = 90
    sleep(duration)
    servo.angle = -90
    sleep(1)
