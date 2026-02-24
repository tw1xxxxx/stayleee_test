import os
import subprocess
import imageio_ffmpeg

def convert_to_hls(input_file, output_dir, segment_time=0.5):
    # Ensure output directory exists
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Get ffmpeg executable path
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    
    # Define output filenames
    playlist_file = os.path.join(output_dir, "playlist.m3u8")
    segment_filename = os.path.join(output_dir, "segment_%03d.ts")

    # HLS conversion command
    # -g 15: Set GOP size to 15 frames (approx 0.5s at 30fps) for precise splitting
    # -sc_threshold 0: Disable scene change detection for consistent segment lengths
    # -c:v libx264: Use H.264 codec
    # -hls_time: Target segment duration
    # -hls_list_size 0: Include all segments in the playlist
    # -f hls: Output format HLS
    
    cmd = [
        ffmpeg_exe,
        "-y", # Overwrite output files
        "-i", input_file,
        "-c:v", "libx264",
        "-c:a", "aac", # Encode audio to AAC
        "-g", "15", 
        "-keyint_min", "15",
        "-sc_threshold", "0",
        "-hls_time", str(segment_time),
        "-hls_list_size", "0",
        "-hls_segment_filename", segment_filename,
        "-f", "hls",
        playlist_file
    ]

    print(f"Running command: {' '.join(cmd)}")
    
    try:
        subprocess.run(cmd, check=True)
        print("Conversion completed successfully!")
        print(f"Playlist: {playlist_file}")
    except subprocess.CalledProcessError as e:
        print(f"Error during conversion: {e}")

if __name__ == "__main__":
    # Define paths relative to the script execution or absolute
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # Assuming script is in root or scripts folder, adjust path to public/videos
    # Let's assume we run this from project root
    project_root = os.getcwd()
    
    input_video = os.path.join(project_root, "public", "videos", "hero-video.mov")
    output_hls_dir = os.path.join(project_root, "public", "videos", "hls")

    print(f"Input: {input_video}")
    print(f"Output: {output_hls_dir}")
    
    if os.path.exists(input_video):
        convert_to_hls(input_video, output_hls_dir)
    else:
        print(f"Input file not found: {input_video}")
