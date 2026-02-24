from PIL import Image
import os

file_path = "foto/2024-11-22-12.22.01.png"

try:
    img = Image.open(file_path)
    print(f"Format: {img.format}")
    print(f"Mode: {img.mode}")
    
    img = img.convert("RGBA")
    # Sample corners and center
    width, height = img.size
    corners = [
        img.getpixel((0, 0)),
        img.getpixel((width-1, 0)),
        img.getpixel((0, height-1)),
        img.getpixel((width-1, height-1))
    ]
    center = img.getpixel((width//2, height//2))
    
    print(f"Corners: {corners}")
    print(f"Center: {center}")
    
    # Analyze color distribution roughly
    colors = img.getcolors(maxcolors=256)
    if colors:
        print(f"Top 5 colors: {sorted(colors, key=lambda x: x[0], reverse=True)[:5]}")
    else:
        print("More than 256 colors")

except Exception as e:
    print(f"Error: {e}")
