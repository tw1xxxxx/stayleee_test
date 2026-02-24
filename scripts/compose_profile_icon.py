from PIL import Image
import os

def create_composite_icon():
    face_path = "public/images/icons8-счастливый-48.png"
    hat_path = "public/images/profile-chef.png"
    output_path = "public/images/profile-chef-happy-v2.png"
    
    if not os.path.exists(face_path) or not os.path.exists(hat_path):
        print("Missing source images")
        return

    face = Image.open(face_path).convert("RGBA")
    hat = Image.open(hat_path).convert("RGBA")
    
    # Resize hat to be larger (e.g., 40x40)
    new_hat_size = (40, 40)
    hat = hat.resize(new_hat_size, Image.Resampling.LANCZOS)
    
    canvas_width = 48
    # Face 48, Hat 40. Overlap 15px to make it sit ON the head.
    overlap = 15
    canvas_height = face.height + hat.height - overlap
    
    canvas = Image.new("RGBA", (canvas_width, canvas_height), (0, 0, 0, 0))
    
    # Place face at bottom
    face_x = (canvas_width - face.width) // 2
    face_y = canvas_height - face.height
    canvas.paste(face, (face_x, face_y), face)
    
    # Place hat at top centered relative to face
    hat_x = (canvas_width - hat.width) // 2
    # Hat bottom should be at face top + overlap
    hat_y = face_y - hat.height + overlap
    
    canvas.paste(hat, (hat_x, hat_y), hat)
    
    # Crop to content box
    bbox = canvas.getbbox()
    if bbox:
        canvas = canvas.crop(bbox)
        
    canvas.save(output_path)
    print(f"Saved composite icon to {output_path}")

create_composite_icon()
