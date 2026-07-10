#!/bin/bash

# Start the backend server
echo "🚀 Starting Cabin Management System Backend..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Please create a .env file with your MongoDB connection string."
    echo ""
fi

# Start the server
node index.js

