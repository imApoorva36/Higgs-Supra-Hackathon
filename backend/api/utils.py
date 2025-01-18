import random
import string
import lgpio
from mfrc522 import SimpleMFRC522
from gpiozero import AngularServo
from time import sleep
import requests
import google.generativeai as genai

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

# Configure the API key for Gemini
genai.configure(api_key="AIzaSyBGtEdqGhFFK1ViDz8EfsMt5FLGG8bq8ms")

def download_image(image_url):
    """Downloads an image from a URL and saves it to a temporary file."""
    response = requests.get(image_url)
    if response.status_code == 200:
        temp_image_path = "/tmp/temp_image.png"
        with open(temp_image_path, "wb") as f:
            f.write(response.content)
        return temp_image_path
    else:
        raise Exception(f"Failed to download image from URL: {image_url}")

def upload_to_gemini(path, mime_type=None):
    """Uploads the given file to Gemini for processing."""
    file = genai.upload_file(path, mime_type=mime_type)
    return file

def verify_image_matches_description(image_url, product_description):
    """Directly verifies if the image matches the given product description."""
    try:
        # Download and upload the image
        image_path = download_image(image_url)
        uploaded_file = upload_to_gemini(image_path, mime_type="image/png")

        # Initialize the model
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={
                "temperature": 0.2,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 8192,
                "response_mime_type": "application/json",
            }
        )

        # Create prompt for direct comparison
        prompt = f"""
        Look at the image and determine if it matches this description: "{product_description}"
        
        Respond in JSON format with two fields:
        - 'isValidPackage': boolean indicating if the image matches the description
        - 'reason': brief explanation of your decision
        
        Focus on the core object match, ignoring minor details.
        """

        # Get response directly comparing image to description
        response = model.generate_content([uploaded_file, prompt])
        return response.text.strip()

    except Exception as e:
        return {
            "isValidPackage": False,
            "reason": f"An error occurred during verification: {str(e)}"
        }
