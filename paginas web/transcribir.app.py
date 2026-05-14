#!/usr/bin/env python3
"""App simple para transcribir TikToks con dialogo popup"""
import subprocess
import os

def main():
    # Usar clipboard para pegar la URL
    script = '''
    set theClipboard to (the clipboard as string)
    display dialog "URL de TikTok (ya esta en tu clipboard):" buttons {"Transcribir", "Cancelar"} default button 1
    return theClipboard
    '''
    result = subprocess.run(['osascript', '-e', script], capture_output=True, text=True)

    if result.returncode != 0:
        print("Cancelado por el usuario")
        input("\nPresiona Enter para cerrar...")
        return

    url = result.stdout.strip()
    if not url or not url.startswith("http"):
        print("No se encontro URL valida en clipboard")
        input("\nPresiona Enter para cerrar...")
        return

    print(f"📥 Descargando: {url}")

    # Crear carpeta si no existe
    os.makedirs("tiktok_videos", exist_ok=True)

    # Descargar video
    dl = subprocess.run(['yt-dlp', '-o', 'tiktok_videos/%(title)s.%(ext)s', url],
                        capture_output=True, text=True)

    if dl.returncode != 0:
        print(f"❌ Error descargando: {dl.stderr}")
        input("\nPresiona Enter para cerrar...")
        return

    # Buscar archivo descargado
    files = sorted(os.listdir("tiktok_videos"), key=lambda x: os.path.getmtime(os.path.join("tiktok_videos", x)))
    video_path = os.path.join("tiktok_videos", files[-1]) if files else None

    if not video_path or not os.path.exists(video_path):
        print("❌ No se encontro el video")
        input("\nPresiona Enter para cerrar...")
        return

    print(f"🎬 Video descargado: {video_path}")
    print(f"✍️ Transcribiendo...")

    # Transcribir
    tr = subprocess.run(['/Library/Developer/CommandLineTools/Library/Frameworks/Python3.framework/Versions/3.9/bin/python3', '-m', 'whisper', video_path, '--model', 'medium'],
                        capture_output=True, text=True)

    if tr.returncode == 0:
        print("\n📝 TRANSCRIPCION:\n")
        print(tr.stdout)
    else:
        print(f"❌ Error transcribiendo: {tr.stderr}")

    input("\nPresiona Enter para cerrar...")

if __name__ == "__main__":
    main()