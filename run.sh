#!/bin/bash

# run.sh - Start local development server for Water Treatment Digital Twin

PORT=${1:-8080}
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Water Treatment Digital Twin - Development Server         ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║  Starting server on http://localhost:$PORT                   ║"
echo "║  Press Ctrl+C to stop                                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

cd "$DIR"

# Try Python 3 first, then Python 2, then Node
if command -v python3 &> /dev/null; then
    echo "Using Python 3 HTTP server..."
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    echo "Using Python 2 HTTP server..."
    python -m SimpleHTTPServer $PORT
elif command -v npx &> /dev/null; then
    echo "Using Node.js http-server..."
    npx http-server -p $PORT -c-1
elif command -v php &> /dev/null; then
    echo "Using PHP built-in server..."
    php -S localhost:$PORT
else
    echo "Error: No suitable HTTP server found."
    echo "Please install Python 3, Node.js, or PHP."
    exit 1
fi
