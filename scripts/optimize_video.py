import os
import subprocess
import imageio_ffmpeg

def convert_to_optimized_mp4(input_file, output_file):
    # Get ffmpeg executable path
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    
    # FFmpeg command for optimized MP4 (Fast Start / Progressive Download)
    # -movflags +faststart: Moves metadata to the beginning of the file so playback can start immediately before the whole file is downloaded.
    # -c:v libx264: Use H.264 codec (widely supported).
    # -preset slow: Better compression for the same quality.
    # -crf 23: Constant Rate Factor (quality). Lower is better quality. 23 is default/good.
    # -an: Remove audio (since it's a background video, this saves bandwidth and ensures autoplay works).
    
    cmd = [
        ffmpeg_exe,
        "-y",
        "-i", input_file,
        "-c:v", "libx264",
        "-preset", "slow",
        "-crf", "23",
        "-movflags", "+faststart",
        "-an", # Remove audio for background video autoplay compliance
        output_file
    ]

    print(f"Running command: {' '.join(cmd)}")
    
    try:
        subprocess.run(cmd, check=True)
        print("Conversion completed successfully!")
        print(f"Output: {output_file}")
    except subprocess.CalledProcessError as e:
        print(f"Error during conversion: {e}")

if __name__ == "__main__":
    project_root = os.getcwd()
    input_video = os.path.join(project_root, "public", "videos", "hero-video.mov")
    output_video = os.path.join(project_root, "public", "videos", "hero-optimized.mp4")

    print(f"Input: {input_video}")
    print(f"Output: {output_video}")
    
    if os.path.exists(input_video):
        convert_to_optimized_mp4(input_video, output_video)
    else:
        print(f"Input file not found: {input_video}")
