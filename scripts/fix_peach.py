import os
from PIL import Image

# Specific settings for Peach logo
# Source: Beige background (225, 221, 214) with White text (255, 255, 255)
# Goal: Keep White text, remove Beige background

SOURCE_FILE = "foto/2024-11-22-12.22.01.png"
TARGET_FILE = "public/images/clients/peach.png"

# Threshold to separate White (255) from Beige (225)
# 240 is a safe midpoint
WHITE_THRESHOLD = 240

def fix_peach_logo():
    if not os.path.exists(SOURCE_FILE):
        print(f"Source file not found: {SOURCE_FILE}")
        return

    try:
        img = Image.open(SOURCE_FILE)
        img = img.convert("RGBA")
        datas = img.getdata()

        new_data = []
        for item in datas:
            # Check if pixel is White (Text)
            # R, G, B > Threshold
            if item[0] > WHITE_THRESHOLD and item[1] > WHITE_THRESHOLD and item[2] > WHITE_THRESHOLD:
                # Keep original white pixel
                new_data.append(item) 
            else:
                # Assume it's background (Beige or darker), make transparent
                new_data.append((255, 255, 255, 0))

        img.putdata(new_data)
        img.save(TARGET_FILE, "PNG")
        print(f"Successfully processed Peach logo to: {TARGET_FILE}")
        
    except Exception as e:
        print(f"Error processing Peach logo: {e}")

if __name__ == "__main__":
    fix_peach_logo()
