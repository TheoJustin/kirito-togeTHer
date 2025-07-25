# Javanese Speech-to-Text Application

This application uses the Hugging Face model `bagasshw/whisper-tiny-javanese-openslr-v3` to transcribe Javanese speech to text.

## Setup

1. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Make sure you have Python 3.7+ installed.

3. **Important**: You need to install ffmpeg on your system:
   - On macOS: `brew install ffmpeg`
   - On Ubuntu/Debian: `sudo apt-get install ffmpeg`
   - On Windows: Download from https://ffmpeg.org/download.html or install via Chocolatey: `choco install ffmpeg`

4. Note: The application uses sounddevice for audio recording, which is easier to install than PyAudio

## Usage

### Command Line Recording Version

```
python app.py [duration_in_seconds]
```

Example (record for 10 seconds):
```
python app.py 10
```

If no duration is specified, it defaults to 5 seconds.

### GUI Recorder Version

Run the GUI recorder application:
```
python gui_recorder.py
```

Then:
1. Set the recording duration in seconds
2. Click "Record" to start recording
3. After recording completes, click "Transcribe" to process the audio
4. View the transcribed text in the result area

### File-based GUI Version

Run the file-based GUI application:
```
python gui_app.py
```

Then:
1. Click "Browse" to select an audio file
2. Click "Transcribe" to start the transcription process
3. Wait for the transcription to complete
4. View the transcribed text in the result area

## Supported Audio Formats

- WAV
- MP3
- OGG
- FLAC

## Notes

- The first time you run the application, it will download the model from Hugging Face, which may take some time depending on your internet connection.
- Transcription performance is better on a system with a GPU, but it will also work on CPU.
- The model is specifically trained for the Javanese language.

## Model Information

This application uses the `bagasshw/whisper-tiny-javanese-openslr-v3` model from Hugging Face, which is a fine-tuned version of Whisper for the Javanese language.

For more information about the model, visit: https://huggingface.co/bagasshw/whisper-tiny-javanese-openslr-v3