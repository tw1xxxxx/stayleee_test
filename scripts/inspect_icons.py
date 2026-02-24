from PIL import Image
import os

def inspect_image(path):
    try:
        if not os.path.exists(path):
            print(f"File not found: {path}")
            return
            
        img = Image.open(path)
        print(f"--- {os.path.basename(path)} ---")
        print(f"Size: {img.size}")
        print(f"Mode: {img.mode}")
        print(f"Format: {img.format}")
    except Exception as e:
        print(f"Error inspecting {path}: {e}")

inspect_image("public/images/icons8-лицо-npc-48.png")
inspect_image("public/images/profile-chef.png")
