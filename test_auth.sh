#!/bin/bash

BASE_URL="http://localhost:3001/api/auth"

echo "Testing Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "name": "Test User"}')

echo "Registration Response: $REGISTER_RESPONSE"

TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Registration failed or token not found."
  # Try login if user already exists
  echo "Trying Login..."
  LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com", "password": "password123"}')
  echo "Login Response: $LOGIN_RESPONSE"
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi

echo "Token: $TOKEN"

if [ -n "$TOKEN" ]; then
  echo "Testing Protected Route (/me)..."
  ME_RESPONSE=$(curl -s -X GET "$BASE_URL/me" \
    -H "Authorization: Bearer $TOKEN")
  echo "Me Response: $ME_RESPONSE"
else
  echo "Could not get token, skipping protected route test."
fi
