from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile
from app import transcribe_audio
import base64

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "ok", "message": "Javanese Speech-to-Text API is running"})

@app.route('/transcribe', methods=['POST'])
def transcribe():
    """
    Endpoint to transcribe Javanese audio to text
    
    Accepts:
    - audio_file: A file upload with the audio content
    - OR
    - audio_base64: Base64 encoded audio data with format prefix (e.g., "data:audio/wav;base64,...")
    
    Returns:
    - JSON with transcription result
    """
    try:
        temp_file = None
        
        if 'audio_file' in request.files:
            # Handle file upload
            audio_file = request.files['audio_file']
            
            # Create a temporary file
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
            temp_file.close()
            
            # Save the uploaded file
            audio_file.save(temp_file.name)
            audio_path = temp_file.name
            
        elif 'audio_base64' in request.json:
            # Handle base64 encoded audio
            audio_base64 = request.json['audio_base64']
            
            # Remove data URL prefix if present (e.g., "data:audio/wav;base64,")
            if ',' in audio_base64:
                audio_base64 = audio_base64.split(',', 1)[1]
            
            # Decode base64 data
            audio_data = base64.b64decode(audio_base64)
            
            # Create a temporary file
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
            temp_file.close()
            
            # Write the decoded data to the file
            with open(temp_file.name, 'wb') as f:
                f.write(audio_data)
            
            audio_path = temp_file.name
        else:
            return jsonify({"error": "No audio data provided. Send either 'audio_file' or 'audio_base64'"}), 400
        
        # Transcribe the audio
        transcription = transcribe_audio(audio_path)
        
        # Clean up the temporary file
        if temp_file:
            os.unlink(temp_file.name)
        
        return jsonify({
            "success": True,
            "transcription": transcription
        })
        
    except Exception as e:
        # Clean up the temporary file in case of error
        if temp_file and os.path.exists(temp_file.name):
            os.unlink(temp_file.name)
        
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)