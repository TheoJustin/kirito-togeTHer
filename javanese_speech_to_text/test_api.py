import requests
import sys
import os
import base64

def test_health_check(api_url):
    """Test the health check endpoint"""
    response = requests.get(f"{api_url}/health")
    print(f"Health Check Status: {response.status_code}")
    try:
        print(f"Response: {response.json()}")
    except Exception:
        print(f"Raw Response: {response.text}")
    print()

def test_transcribe_file(api_url, audio_file_path):
    """Test transcription with a file upload"""
    if not os.path.exists(audio_file_path):
        print(f"Error: File {audio_file_path} does not exist")
        return
    
    print(f"Testing transcription with file: {audio_file_path}")
    
    with open(audio_file_path, 'rb') as f:
        files = {'audio_file': f}
        response = requests.post(f"{api_url}/transcribe", files=files)
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_transcribe_base64(api_url, audio_file_path):
    """Test transcription with base64 encoded audio"""
    if not os.path.exists(audio_file_path):
        print(f"Error: File {audio_file_path} does not exist")
        return
    
    print(f"Testing transcription with base64 encoded file: {audio_file_path}")
    
    with open(audio_file_path, 'rb') as f:
        audio_data = f.read()
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        # Add data URL prefix
        audio_base64 = f"data:audio/wav;base64,{audio_base64}"
        
        response = requests.post(
            f"{api_url}/transcribe", 
            json={'audio_base64': audio_base64}
        )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

if __name__ == "__main__":
    api_url = "http://localhost:5000"
    
    # Test health check
    test_health_check(api_url)
    
    # Check if audio file path is provided
    if len(sys.argv) > 1:
        audio_file_path = sys.argv[1]
        
        # Test with file upload
        test_transcribe_file(api_url, audio_file_path)
        
        # Test with base64 encoding
        test_transcribe_base64(api_url, audio_file_path)
    else:
        print("Usage: python test_api.py <path_to_audio_file>")
        print("No audio file provided. Only health check was performed.")