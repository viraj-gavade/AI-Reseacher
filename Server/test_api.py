import requests
import json
import os

# Configuration
BASE_URL = "http://localhost:8000/api/v1"
TEST_USER = {
    "username": "testuser123",
    "email": "test123@example.com",
    "password": "testpass123",
    "full_name": "Test User 123"
}

def test_api():
    """Test the FastAPI endpoints"""
    print("🧪 Testing PDF Chat API")
    print("=" * 50)
    
    # Test health check
    print("1. Testing health check...")
    try:
        response = requests.get("http://localhost:8000/health")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   Error: {e}")
        return
    
    print()
    
    # Test user registration
    print("2. Testing user registration...")
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=TEST_USER)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   Error: {e}")
    
    print()
    
    # Test user login
    print("3. Testing user login...")
    try:
        login_data = {
            "username": TEST_USER["username"],
            "password": TEST_USER["password"]
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            tokens = response.json()
            access_token = tokens["access_token"]
            print(f"   Login successful! Got access token.")
            
            # Test authenticated endpoint
            print()
            print("4. Testing authenticated endpoint (get user info)...")
            headers = {"Authorization": f"Bearer {access_token}"}
            
            response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.json()}")
            
            # Test file list
            print()
            print("5. Testing file list endpoint...")
            response = requests.get(f"{BASE_URL}/uploads/pdfs", headers=headers)
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.json()}")
            
            # Test chat endpoint
            print()
            print("6. Testing chat endpoint...")
            chat_data = {"message": "Hello, this is a test message!"}
            response = requests.post(f"{BASE_URL}/chat/message", json=chat_data, headers=headers)
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.json()}")
            
        else:
            print(f"   Login failed: {response.json()}")
            
    except Exception as e:
        print(f"   Error: {e}")
    
    print()
    print("🎉 API testing completed!")

if __name__ == "__main__":
    test_api()
