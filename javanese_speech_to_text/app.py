import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
import soundfile as sf
import sys
import sounddevice as sd
import numpy as np
import tempfile
import os
import time

def transcribe_audio(audio_path):
    """
    Transcribe Javanese audio to text using the whisper-tiny-javanese model.
    
    Args:
        audio_path: Path to the audio file to transcribe
    
    Returns:
        Transcribed text
    """
    # Check if CUDA is available
    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32
    
    # Model ID on Hugging Face
    model_id = "bagasshw/whisper-tiny-javanese-openslr-v3"
    
    # Load model and processor
    model = AutoModelForSpeechSeq2Seq.from_pretrained(
        model_id, 
        torch_dtype=torch_dtype,
        low_cpu_mem_usage=True,
        use_safetensors=True
    )
    model.to(device)
    
    processor = AutoProcessor.from_pretrained(model_id)
    
    # Create pipeline
    pipe = pipeline(
        "automatic-speech-recognition",
        model=model,
        tokenizer=processor.tokenizer,
        feature_extractor=processor.feature_extractor,
        max_new_tokens=128,
        chunk_length_s=30,
        batch_size=16,
        return_timestamps=False,
        torch_dtype=torch_dtype,
        device=device,
    )
    
    # Perform transcription
    result = pipe(audio_path, generate_kwargs={"language": "jw"})
    
    return result["text"]

def record_audio(duration=5, sample_rate=16000):
    """
    Record audio from the microphone for a specified duration.
    
    Args:
        duration: Recording duration in seconds
        sample_rate: Audio sample rate
    
    Returns:
        Path to the recorded audio file
    """
    # Audio recording parameters
    channels = 1
    
    print(f"Recording for {duration} seconds...")
    
    # Record audio
    recording = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=channels, dtype='float32')
    sd.wait()  # Wait until recording is finished
    
    print("Recording finished")
    
    # Create a temporary file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
    temp_file.close()
    
    # Save the recorded audio to the temporary file
    sf.write(temp_file.name, recording, sample_rate)
    
    return temp_file.name

if __name__ == "__main__":
    try:
        # Check if duration is provided as argument
        duration = 5  # default duration
        if len(sys.argv) > 1:
            try:
                duration = int(sys.argv[1])
            except ValueError:
                print("Invalid duration. Using default 5 seconds.")
        
        print(f"Javanese Speech-to-Text Recorder")
        print(f"Press Enter to start recording for {duration} seconds...")
        input()
        
        # Record audio
        audio_path = record_audio(duration=duration)
        
        print("Processing the audio...")
        # Transcribe the recorded audio
        transcription = transcribe_audio(audio_path)
        
        print("\nTranscription:")
        print(transcription)
        
        # Clean up the temporary file
        os.unlink(audio_path)
        
    except KeyboardInterrupt:
        print("\nRecording cancelled.")
    except Exception as e:
        print(f"Error: {e}")
