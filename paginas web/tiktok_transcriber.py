#!/usr/bin/env python3
"""
TikTok Video Transcriber
Usage: python3 tiktok_transcriber.py <url>
"""

import sys
import subprocess
import os

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 tiktok_transcriber.py <tiktok_url>")
        print("Example: python3 tiktok_transcriber.py https://www.tiktok.com/@user/video/123")
        sys.exit(1)

    url = sys.argv[1]
    output_dir = "tiktok_videos"
    os.makedirs(output_dir, exist_ok=True)

    print(f"📥 Descargando video de TikTok...")
    result = subprocess.run(
        ["yt-dlp", "-o", f"{output_dir}/%(title)s.%(ext)s", url],
        capture_output=True, text=True
    )

    if result.returncode != 0:
        print(f"❌ Error descargando: {result.stderr}")
        sys.exit(1)

    video_path = result.stdout.strip()
    for line in result.stdout.split('\n'):
        if 'Destination' in line:
            video_path = line.split('Destination:')[1].strip()
            break

    if not video_path or not os.path.exists(video_path):
        files = os.listdir(output_dir)
        if files:
            video_path = os.path.join(output_dir, files[-1])
        else:
            print("❌ No se encontró el video descargado")
            sys.exit(1)

    print(f"🎬 Video descargado: {video_path}")
    print(f"✍️ Transcribiendo...")

    result = subprocess.run(
        ["python3", "-m", "whisper", video_path, "--model", "medium"],
        capture_output=True, text=True
    )

    if result.returncode != 0:
        print(f"❌ Error transcribiendo: {result.stderr}")
        sys.exit(1)

    print("\n📝 TRANSCRIPCIÓN:\n")
    print(result.stdout)

if __name__ == "__main__":
    main()