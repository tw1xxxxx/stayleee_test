import os
import subprocess
import shutil

def split_video():
    base_dir = os.getcwd()
    input_file = os.path.join(base_dir, "public", "videos", "hero-optimized.webm")
    output_dir = os.path.join(base_dir, "public", "videos", "hls")
    segment_duration = 0.5
    fallback_mp4 = os.path.join(base_dir, "public", "videos", "hero-inline.mp4")
    poster_image = os.path.join(base_dir, "public", "videos", "hero-poster.jpg")
    mp4_duration_seconds = "12"
    
    print(f"Input file: {input_file}")
    print(f"Output dir: {output_dir}")
    
    if not os.path.exists(input_file):
        print(f"Error: Input file not found at {input_file}")
        video_dir = os.path.join(base_dir, "public", "videos")
        video_files = [f for f in os.listdir(video_dir) if f.endswith(('.mp4', '.webm', '.mov'))]
        if video_files:
            input_file = os.path.join(video_dir, video_files[0])
            print(f"Found alternative video: {input_file}")
        else:
            return

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    print("Cleaning up old segments...")
    for f in os.listdir(output_dir):
        file_path = os.path.join(output_dir, f)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
        except Exception as e:
            print(f"Error deleting {file_path}: {e}")
        
    output_playlist = os.path.join(output_dir, "playlist.m3u8")
    segment_filename = os.path.join(output_dir, "segment_%03d.ts")

    cmd = [
        "ffmpeg",
        "-y",
        "-i", input_file,
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-crf", "26",
        "-vf", "scale=-2:720",
        "-g", "15",
        "-sc_threshold", "0",
        "-hls_time", str(segment_duration),
        "-hls_list_size", "0",
        "-hls_segment_filename", segment_filename,
        output_playlist
    ]
    
    print("Running ffmpeg command for HLS...")
    try:
        subprocess.run(cmd, check=True)
        print("Video splitting complete successfully.")

        try:
            with open(output_playlist, "r", encoding="utf-8") as f:
                lines = f.read().splitlines()

            max_duration = 0.0
            for line in lines:
                if line.startswith("#EXTINF:"):
                    value = line.split(":", 1)[1].split(",", 1)[0]
                    try:
                        duration = float(value)
                        if duration > max_duration:
                            max_duration = duration
                    except ValueError:
                        continue

            if max_duration > 0:
                from math import ceil
                target = max(1, ceil(max_duration))
                new_lines = []
                for line in lines:
                    if line.startswith("#EXT-X-TARGETDURATION:"):
                        new_lines.append(f"#EXT-X-TARGETDURATION:{target}")
                    else:
                        new_lines.append(line)

                with open(output_playlist, "w", encoding="utf-8") as f:
                    f.write("\n".join(new_lines) + "\n")

                print(f"Adjusted TARGETDURATION to {target}")
        except FileNotFoundError:
            print("Warning: playlist.m3u8 not found for post-processing.")

        print("Generating fallback MP4 for browsers without HLS support...")
        mp4_cmd = [
            "ffmpeg",
            "-y",
            "-i",
            input_file,
            "-t",
            mp4_duration_seconds,
            "-c:v",
            "libx264",
            "-profile:v",
            "main",
            "-level",
            "4.0",
            "-pix_fmt",
            "yuv420p",
            "-preset",
            "veryslow",
            "-crf",
            "20",
            "-vf",
            "zscale=t=linear:npl=100,format=gbrpf32le,zscale=primaries=bt709:transfer=bt709:matrix=bt709,tonemap=hable,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,scale=-2:1920",
            "-color_primaries",
            "bt709",
            "-color_trc",
            "bt709",
            "-colorspace",
            "bt709",
            "-g",
            "30",
            "-keyint_min",
            "30",
            "-sc_threshold",
            "0",
            "-movflags",
            "+faststart",
            "-an",
            fallback_mp4,
        ]
        try:
            subprocess.run(mp4_cmd, check=True)
            print("Fallback MP4 generated successfully.")
        except subprocess.CalledProcessError as e:
            print(f"Error generating fallback MP4: {e}")

        print("Generating poster image from first frame...")
        poster_cmd = [
            "ffmpeg",
            "-y",
            "-ss",
            "0.1",
            "-i",
            fallback_mp4,
            "-frames:v",
            "1",
            "-q:v",
            "2",
            "-update",
            "1",
            poster_image,
        ]
        try:
            subprocess.run(poster_cmd, check=True)
            print("Poster image generated successfully.")
        except subprocess.CalledProcessError as e:
            print(f"Error generating poster image: {e}")
    except subprocess.CalledProcessError as e:
        print(f"Error running ffmpeg: {e}")
    except FileNotFoundError:
        print("Error: ffmpeg not found. Please install ffmpeg.")

if __name__ == "__main__":
    split_video()
