
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_cors import CORS
import requests
import os
from database import get_user_by_email

views_bp = Blueprint('views', __name__)
CORS(views_bp)  # Enable CORS for all routes in this blueprint

# API endpoints
@views_bp.route('/api/login', methods=['POST'])
def login():
    """Handle login requests and return user data."""
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    # For demonstration purposes - in a real app, you'd validate the password
    user = get_user_by_email(email)
    
    if user:
        user_data = {
            "user_id": user[0],
            "username": user[1],
            "email": user[2]
        }
        return jsonify(user_data), 200
    
    return jsonify({"error": "Invalid credentials"}), 401

@views_bp.route('/api/dashboard/<int:user_id>')
def dashboard_data(user_id):
    """Get dashboard data for a user."""
    # Get fridges
    fridges_response = requests.get(f'http://localhost:5000/fridges/user/{user_id}')
    fridges = fridges_response.json() if fridges_response.status_code == 200 else []
    
    # Get products
    products_response = requests.get(f'http://localhost:5000/products/user/{user_id}')
    products = products_response.json() if products_response.status_code == 200 else []
    
    # Calculate summary statistics
    total_fridges = len(fridges)
    total_products = len(products)
    
    return jsonify({
        "stats": {
            "total_fridges": total_fridges,
            "total_products": total_products
        },
        "recent_fridges": fridges[:3],
        "recent_products": products[:3]
    }), 200

@views_bp.route('/api/health')
def health_check():
    """Simple health check endpoint."""
    return jsonify({"status": "ok", "message": "Service is running"}), 200

# Serve React App
@views_bp.route('/', defaults={'path': ''})
@views_bp.route('/<path:path>')
def serve_react(path):
    """Serve the React frontend."""
    if path and os.path.exists(os.path.join(current_app.static_folder, path)):
        return send_from_directory(current_app.static_folder, path)
    else:
        return send_from_directory(current_app.static_folder, 'index.html')
