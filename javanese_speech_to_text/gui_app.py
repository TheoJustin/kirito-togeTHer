import tkinter as tk
from tkinter import filedialog, scrolledtext
import threading
import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline

class JavaneseSpeechToTextApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Javanese Speech-to-Text")
        self.root.geometry("600x500")
        
        # Model loading status
        self.model_loaded = False
        self.model = None
        self.processor = None
        self.pipe = None
        
        # Create UI elements
        self.create_widgets()
    
    def create_widgets(self):
        # Frame for file selection
        file_frame = tk.Frame(self.root)
        file_frame.pack(fill=tk.X, padx=20, pady=20)
        
        self.file_path_var = tk.StringVar()
        self.file_path_entry = tk.Entry(file_frame, textvariable=self.file_path_var, width=50)
        self.file_path_entry.pack(side=tk.LEFT, padx=(0, 10), fill=tk.X, expand=True)
        
        self.browse_button = tk.Button(file_frame, text="Browse", command=self.browse_file)
        self.browse_button.pack(side=tk.RIGHT)
        
        # Transcribe button
        self.transcribe_button = tk.Button(self.root, text="Transcribe", command=self.start_transcription)
        self.transcribe_button.pack(pady=10)
        
        # Status label
        self.status_var = tk.StringVar()
        self.status_var.set("Ready")
        self.status_label = tk.Label(self.root, textvariable=self.status_var)
        self.status_label.pack(pady=5)
        
        # Text area for transcription result
        self.result_label = tk.Label(self.root, text="Transcription Result:")
        self.result_label.pack(anchor=tk.W, padx=20, pady=(10, 5))
        
        self.result_text = scrolledtext.ScrolledText(self.root, wrap=tk.WORD, height=15)
        self.result_text.pack(fill=tk.BOTH, expand=True, padx=20, pady=(0, 20))
    
    def browse_file(self):
        file_path = filedialog.askopenfilename(
            filetypes=[
                ("Audio Files", "*.wav *.mp3 *.ogg *.flac"),
                ("All Files", "*.*")
            ]
        )
        if file_path:
            self.file_path_var.set(file_path)
    
    def load_model(self):
        if not self.model_loaded:
            self.status_var.set("Loading model... This may take a while.")
            self.root.update()
            
            # Check if CUDA is available
            device = "cuda:0" if torch.cuda.is_available() else "cpu"
            torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32
            
            # Model ID on Hugging Face
            model_id = "bagasshw/whisper-tiny-javanese-openslr-v3"
            
            try:
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
                self.status_var.set("Model loaded successfully")
            except Exception as e:
                self.status_var.set(f"Error loading model: {str(e)}")
    
    def start_transcription(self):
        audio_path = self.file_path_var.get()
        if not audio_path:
            self.status_var.set("Please select an audio file first")
            return
        
        # Start transcription in a separate thread to keep UI responsive
        threading.Thread(target=self.transcribe_audio, args=(audio_path,), daemon=True).start()
    
    def transcribe_audio(self, audio_path):
        self.status_var.set("Transcribing... Please wait.")
        self.transcribe_button.config(state=tk.DISABLED)
        self.root.update()
        
        try:
            # Load model if not already loaded
            if not self.model_loaded:
                self.load_model()
                if not self.model_loaded:
                    return
            
            # Perform transcription
            result = self.pipe(audio_path, generate_kwargs={"language": "jv"})
            
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
    app = JavaneseSpeechToTextApp(root)
    root.mainloop()