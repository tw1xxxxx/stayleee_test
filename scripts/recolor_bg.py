import os
from PIL import Image

# Mapping from original files to target names
MAPPING = {
    "2024-11-22-12.20.41.png": "yauza.png",
    "2024-11-22-12.21.08.png": "wa-garden.png",
    "2024-11-22-12.21.14.png": "padron.png",
    "2024-11-22-12.21.20.png": "hitsunov.png",
    "2024-11-22-12.21.25.png": "margarita.png",
    "2024-11-22-12.21.30.png": "sei.png",
    "2024-11-22-12.21.34.png": "korobok.png",
    "2024-11-22-12.21.39.png": "345.png",
    "2024-11-22-12.21.43.png": "white-rabbit.png",
    "2024-11-22-12.21.48.png": "loona.png",
    "2024-11-22-12.21.55.png": "selfie.png",
    "2024-11-22-12.22.01.png": "peach.png"
}

TARGET_COLOR = (225, 221, 214) # #E1DDD6
THRESHOLD = 230 # Higher threshold to catch only very light pixels

def recolor_background(source_path, target_path):
    try:
        img = Image.open(source_path)
        img = img.convert("RGBA")
        datas = img.getdata()

        new_data = []
        for item in datas:
            # Check if the pixel is close to white
            if item[0] > THRESHOLD and item[1] > THRESHOLD and item[2] > THRESHOLD:
                # Replace with target solid color, full opacity
                new_data.append((TARGET_COLOR[0], TARGET_COLOR[1], TARGET_COLOR[2], 255))
            else:
                new_data.append(item)

        img.putdata(new_data)
        img.save(target_path, "PNG")
        print(f"Processed: {target_path}")
    except Exception as e:
        print(f"Error processing {source_path}: {e}")

source_dir = "foto"
target_dir = "public/images/clients"

if not os.path.exists(target_dir):
    os.makedirs(target_dir)

for src_file, target_file in MAPPING.items():
    source_path = os.path.join(source_dir, src_file)
    target_path = os.path.join(target_dir, target_file)
    
    if os.path.exists(source_path):
        recolor_background(source_path, target_path)
    else:
        print(f"Source file not found: {source_path}")
