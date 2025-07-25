# Javanese Speech-to-Text API

This API provides speech-to-text transcription for Javanese language audio using the `whisper-tiny-javanese` model.

## Setup

1. Install the required dependencies:

```bash
pip install -r requirements.txt
```

2. Start the API server:

```bash
./start_api.sh
```

Or manually:

```bash
python api.py
```

The API will run on `http://localhost:5000` by default.

## API Endpoints

### Health Check

```
GET /health
```

Returns the status of the API.

**Response:**
```json
{
  "status": "ok",
  "message": "Javanese Speech-to-Text API is running"
}
```

### Transcribe Audio

```
POST /transcribe
```

Transcribes Javanese audio to text.

**Request Options:**

1. **File Upload:**
   - Form data with an `audio_file` field containing a WAV audio file.

2. **Base64 Encoded Audio:**
   - JSON body with an `audio_base64` field containing base64-encoded audio data.
   - Can include data URL prefix (e.g., `data:audio/wav;base64,...`)

**Response:**
```json
{
  "success": true,
  "transcription": "Transcribed text in Javanese"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Integration with Next.js

A React component for the Next.js application is available at:
`/together/src/components/JavaneseSpeechToText.tsx`

### Usage Example:

```tsx
import JavaneseSpeechToText from '@/components/JavaneseSpeechToText';

export default function MyPage() {
  const handleTranscription = (text: string) => {
    console.log('Transcribed text:', text);
    // Do something with the transcription
  };

  return (
    <div>
      <h1>Javanese Speech Recognition</h1>
      <JavaneseSpeechToText 
        onTranscriptionComplete={handleTranscription}
        apiUrl="http://localhost:5000/transcribe"
      />
    </div>
  );
}
```