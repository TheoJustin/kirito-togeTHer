import tkinter as tk
import threading
import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
import sounddevice as sd
import soundfile as sf
import numpy as np
import tempfile
import os
import time

class JavaneseSpeechRecorderApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Javanese Speech-to-Text Recorder")
        self.root.geometry("600x500")
        
        # Model loading status
        self.model_loaded = False
        self.model = None
        self.processor = None
        self.pipe = None
        
        # Recording status
        self.is_recording = False
        self.audio_path = None
        
        # Create UI elements
        self.create_widgets()
        
        # Start loading model in background
        threading.Thread(target=self.load_model, daemon=True).start()
    
    def create_widgets(self):
        # Recording controls frame
        control_frame = tk.Frame(self.root)
        control_frame.pack(fill=tk.X, padx=20, pady=20)
        
        self.duration_label = tk.Label(control_frame, text="Recording duration (seconds):")
        self.duration_label.pack(side=tk.LEFT, padx=(0, 10))
        
        self.duration_var = tk.StringVar(value="5")
        self.duration_entry = tk.Entry(control_frame, textvariable=self.duration_var, width=5)
        self.duration_entry.pack(side=tk.LEFT, padx=(0, 20))
        
        self.record_button = tk.Button(control_frame, text="Record", command=self.toggle_recording)
        self.record_button.pack(side=tk.LEFT, padx=10)
        
        self.transcribe_button = tk.Button(control_frame, text="Transcribe", command=self.transcribe_audio, state=tk.DISABLED)
        self.transcribe_button.pack(side=tk.LEFT, padx=10)
        
        # Status label
        self.status_var = tk.StringVar()
        self.status_var.set("Loading model...")
        self.status_label = tk.Label(self.root, textvariable=self.status_var)
        self.status_label.pack(pady=5)
        
        # Text area for transcription result
        self.result_label = tk.Label(self.root, text="Transcription Result:")
        self.result_label.pack(anchor=tk.W, padx=20, pady=(10, 5))
        
        self.result_text = tk.Text(self.root, wrap=tk.WORD, height=15)
        self.result_text.pack(fill=tk.BOTH, expand=True, padx=20, pady=(0, 20))
        
        # Add scrollbar to text area
        scrollbar = tk.Scrollbar(self.result_text)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.result_text.config(yscrollcommand=scrollbar.set)
        scrollbar.config(command=self.result_text.yview)
    
    def load_model(self):
        try:
            # Check if CUDA is available
            device = "cuda:0" if torch.cuda.is_available() else "cpu"
            torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32
            
            # Model ID on Hugging Face
            model_id = "bagasshw/whisper-tiny-javanese-openslr-v3"
            
            # Load model and processor
            self.model = AutoModelForSpeechSeq2Seq.from_pretrained(
                model_id, 
                torch_dtype=torch_dtype,
                low_cpu_mem_usage=True,
                use_safetensors=True
            )
            self.model.to(device)
            
            self.processor = AutoProcessor.from_pretrained(model_id)
            
            # Create pipeline
            self.pipe = pipeline(
                "automatic-speech-recognition",
                model=self.model,
                tokenizer=self.processor.tokenizer,
                feature_extractor=self.processor.feature_extractor,
                max_new_tokens=128,
                chunk_length_s=30,
                batch_size=16,
                return_timestamps=False,
                torch_dtype=torch_dtype,
                device=device,
            )
            
            self.model_loaded = True
            self.status_var.set("Ready to record")
        except Exception as e:
            self.status_var.set(f"Error loading model: {str(e)}")
    
    def toggle_recording(self):
        if self.is_recording:
            self.stop_recording()
        else:
            self.start_recording()
    
    def start_recording(self):
        try:
            duration = int(self.duration_var.get())
            if duration <= 0:
                self.status_var.set("Duration must be positive")
                return
        except ValueError:
            self.status_var.set("Invalid duration")
            return
        
        self.is_recording = True
        self.record_button.config(text="Stop Recording")
        self.transcribe_button.config(state=tk.DISABLED)
        
        # Start recording in a separate thread
        threading.Thread(target=self.record_audio, args=(duration,), daemon=True).start()
    
    def stop_recording(self):
        self.is_recording = False
        self.record_button.config(text="Record")
    
    def record_audio(self, duration):
        # Audio recording parameters
        sample_rate = 16000
        channels = 1
        
        self.status_var.set(f"Recording for {duration} seconds...")
        
        # Record audio
        recording = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=channels, dtype='float32')
        
        # Wait for recording to complete or until stopped
        for _ in range(int(duration * 10)):  # Check every 100ms
            if not self.is_recording:
                break
            time.sleep(0.1)
        
        # Stop recording if it's still going
        sd.stop()
        
        # Create a temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
        temp_file.close()
        
        # Save the recorded audio to the temporary file
        sf.write(temp_file.name, recording, sample_rate)
        
        self.audio_path = temp_file.name
        self.status_var.set("Recording finished")
        self.record_button.config(text="Record")
        self.is_recording = False
        self.transcribe_button.config(state=tk.NORMAL)
    
    def transcribe_audio(self):
        if not self.audio_path:
            self.status_var.set("No recording available")
            return
        
        if not self.model_loaded:
            self.status_var.set("Model not loaded yet")
            return
        
        self.status_var.set("Transcribing... Please wait.")
        self.transcribe_button.config(state=tk.DISABLED)
        
        # Start transcription in a separate thread
        threading.Thread(target=self.process_transcription, daemon=True).start()
    
    def process_transcription(self):
        try:
            # Perform transcription
            result = self.pipe(self.audio_path, generate_kwargs={"language": "jw"})
            
            # Update UI with result
            self.result_text.delete(1.0, tk.END)
            self.result_text.insert(tk.END, result["text"])
            self.status_var.set("Transcription complete")
        except Exception as e:
            self.status_var.set(f"Error during transcription: {str(e)}")
            self.result_text.delete(1.0, tk.END)
            self.result_text.insert(tk.END, f"Error: {str(e)}")
        finally:
            self.transcribe_button.config(state=tk.NORMAL)

if __name__ == "__main__":
    root = tk.Tk()
    app = JavaneseSpeechRecorderApp(root)
    root.mainloop()