#!/usr/bin/env python3
"""
TikTok Video Transcriber con interfaz gráfica
Usage: python3 tiktok_transcriber_gui.py
Versión con configuración persistente de carpetas.
"""

import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext, filedialog
import subprocess
import threading
import os
import sys
import json
from datetime import datetime

# ── Ruta del archivo de configuración (siempre junto al script) ────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(SCRIPT_DIR, "transcriber_config.json")

def load_config():
    """Carga la configuración guardada, o devuelve valores por defecto."""
    defaults = {
        "output_folder": os.path.join(SCRIPT_DIR, "tiktok_videos"),
        "whisper_model": "medium",
        "window_geometry": "750x560",
    }
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r") as f:
                saved = json.load(f)
            defaults.update(saved)
        except Exception:
            pass
    return defaults

def save_config(cfg: dict):
    """Guarda la configuración en disco."""
    try:
        with open(CONFIG_FILE, "w") as f:
            json.dump(cfg, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"[config] No se pudo guardar: {e}")


class TikTokTranscriber:
    def __init__(self, root):
        self.root = root
        self.cfg = load_config()

        self.root.title("TikTok Transcriber")
        self.root.geometry(self.cfg.get("window_geometry", "750x560"))
        self.root.resizable(True, True)

        # Guarda geometría al cerrar
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

        self._build_ui()
        self.transcription = ""

    # ── UI ─────────────────────────────────────────────────────────────────
    def _build_ui(self):
        pad = dict(padx=14, pady=4)

        # ── URL ────────────────────────────────────────────────────────────
        url_frame = tk.LabelFrame(self.root, text="URL del video de TikTok", **pad)
        url_frame.pack(fill=tk.X, **pad)
        self.url_entry = tk.Entry(url_frame, width=85)
        self.url_entry.pack(fill=tk.X, padx=6, pady=6)

        # ── Carpeta de salida ──────────────────────────────────────────────
        folder_frame = tk.LabelFrame(self.root, text="📁  Carpeta de destino (se guarda automáticamente)", **pad)
        folder_frame.pack(fill=tk.X, **pad)

        folder_row = tk.Frame(folder_frame)
        folder_row.pack(fill=tk.X, padx=6, pady=6)

        self.folder_var = tk.StringVar(value=self.cfg["output_folder"])
        self.folder_entry = tk.Entry(folder_row, textvariable=self.folder_var, width=68)
        self.folder_entry.pack(side=tk.LEFT, fill=tk.X, expand=True)

        browse_btn = tk.Button(folder_row, text="📂 Examinar", command=self.browse_folder)
        browse_btn.pack(side=tk.LEFT, padx=(6, 0))

        # ── Modelo Whisper ─────────────────────────────────────────────────
        model_frame = tk.LabelFrame(self.root, text="Modelo Whisper", **pad)
        model_frame.pack(fill=tk.X, **pad)

        self.model_var = tk.StringVar(value=self.cfg.get("whisper_model", "medium"))
        for m in ("tiny", "base", "small", "medium", "large"):
            tk.Radiobutton(model_frame, text=m, variable=self.model_var, value=m).pack(
                side=tk.LEFT, padx=8, pady=4
            )

        # ── Botones principales ────────────────────────────────────────────
        btn_frame = tk.Frame(self.root)
        btn_frame.pack(pady=6)

        self.download_btn = tk.Button(
            btn_frame, text="▶  Descargar y Transcribir",
            command=self.start_transcription, bg="#1a73e8", fg="white",
            font=("Helvetica", 11, "bold"), padx=10
        )
        self.download_btn.pack(side=tk.LEFT, padx=6)

        self.clear_btn = tk.Button(btn_frame, text="🗑 Limpiar", command=self.clear)
        self.clear_btn.pack(side=tk.LEFT, padx=6)

        self.save_btn = tk.Button(
            btn_frame, text="💾 Guardar transcripción",
            command=self.save_transcription, state=tk.DISABLED
        )
        self.save_btn.pack(side=tk.LEFT, padx=6)

        # ── Progreso y estado ──────────────────────────────────────────────
        self.progress = ttk.Progressbar(self.root, mode="indeterminate")
        self.progress.pack(fill=tk.X, padx=14, pady=2)

        self.status_label = tk.Label(self.root, text="Listo ✔", anchor="w")
        self.status_label.pack(fill=tk.X, padx=14)

        # ── Área de texto ──────────────────────────────────────────────────
        self.text_area = scrolledtext.ScrolledText(
            self.root, wrap=tk.WORD, width=85, height=16
        )
        self.text_area.pack(padx=14, pady=(4, 10), fill=tk.BOTH, expand=True)

    # ── Carpeta ────────────────────────────────────────────────────────────
    def browse_folder(self):
        current = self.folder_var.get() or SCRIPT_DIR
        chosen = filedialog.askdirectory(
            title="Selecciona la carpeta de destino",
            initialdir=current
        )
        if chosen:
            self.folder_var.set(chosen)
            self._persist_config()          # guarda inmediatamente

    # ── Persistencia ───────────────────────────────────────────────────────
    def _persist_config(self):
        self.cfg["output_folder"] = self.folder_var.get()
        self.cfg["whisper_model"] = self.model_var.get()
        self.cfg["window_geometry"] = self.root.geometry()
        save_config(self.cfg)

    def on_close(self):
        """Guarda config al cerrar la ventana y sale."""
        self._persist_config()
        self.root.destroy()

    # ── Transcripción ──────────────────────────────────────────────────────
    def start_transcription(self):
        url = self.url_entry.get().strip()
        if not url:
            messagebox.showerror("Error", "Ingresa una URL de TikTok")
            return

        # Guardar carpeta y modelo antes de empezar
        self._persist_config()

        self.download_btn.config(state=tk.DISABLED)
        self.save_btn.config(state=tk.DISABLED)
        self.progress.start()
        self.status_label.config(text="⏳ Descargando video…")
        self.text_area.delete(1.0, tk.END)

        thread = threading.Thread(target=self.process_video, args=(url,), daemon=True)
        thread.start()

    def process_video(self, url):
        output_dir = self.folder_var.get()
        os.makedirs(output_dir, exist_ok=True)

        try:
            # ── Descargar ──────────────────────────────────────────────────
            result = subprocess.run(
                ["yt-dlp", "-o", os.path.join(output_dir, "%(title)s.%(ext)s"), url],
                capture_output=True, text=True, timeout=120,
            )
            if result.returncode != 0:
                self.on_error(f"Error descargando:\n{result.stderr}")
                return

            # ── Buscar archivo ─────────────────────────────────────────────
            files = sorted(
                os.listdir(output_dir),
                key=lambda x: os.path.getmtime(os.path.join(output_dir, x)),
            )
            if not files:
                self.on_error("No se encontró el video descargado.")
                return

            video_path = os.path.join(output_dir, files[-1])
            self.root.after(0, lambda: self.status_label.config(
                text="✍️  Transcribiendo… (puede tardar varios minutos)"
            ))
            self.root.after(0, lambda: self.text_area.insert(
                tk.END, f"🎬 Video: {video_path}\n\n"
            ))

            # ── Transcribir ────────────────────────────────────────────────
            model = self.model_var.get()
            result = subprocess.run(
                ["python3", "-m", "whisper", video_path, "--model", model],
                capture_output=True, text=True, timeout=600,
            )
            if result.returncode != 0:
                self.on_error(f"Error transcribiendo:\n{result.stderr}")
                return

            self.transcription = result.stdout
            self.root.after(0, lambda: self.text_area.insert(tk.END, "📝 TRANSCRIPCIÓN:\n\n"))
            self.root.after(0, lambda: self.text_area.insert(tk.END, result.stdout))
            self.on_success()

        except subprocess.TimeoutExpired:
            self.on_error("Tiempo agotado. El video es muy largo o hay problemas de conexión.")
        except Exception as e:
            self.on_error(str(e))

    def on_error(self, msg):
        self.root.after(0, lambda: [
            self.progress.stop(),
            self.download_btn.config(state=tk.NORMAL),
            self.status_label.config(text="❌ Error"),
            messagebox.showerror("Error", msg),
        ])

    def on_success(self):
        self.root.after(0, lambda: [
            self.progress.stop(),
            self.download_btn.config(state=tk.NORMAL),
            self.save_btn.config(state=tk.NORMAL),
            self.status_label.config(text="✅ Transcripción completada"),
        ])

    def save_transcription(self):
        if not self.transcription:
            return
        output_dir = self.folder_var.get()
        os.makedirs(output_dir, exist_ok=True)
        filename = os.path.join(
            output_dir,
            f"transcription_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        )
        with open(filename, "w") as f:
            f.write(self.transcription)
        messagebox.showinfo("Guardado", f"Transcripción guardada en:\n{filename}")

    def clear(self):
        self.url_entry.delete(0, tk.END)
        self.text_area.delete(1.0, tk.END)
        self.transcription = ""
        self.save_btn.config(state=tk.DISABLED)
        self.status_label.config(text="Listo ✔")


if __name__ == "__main__":
    root = tk.Tk()
    app = TikTokTranscriber(root)
    root.mainloop()