"""
Main entry point for the Smart Fridge application.
Handles application initialization and configuration.
"""

import os
import subprocess
from flask import Flask
from flask_cors import CORS
from database import initialize_database

# Import blueprints
from user import user_bp
from product import product_bp
from fridge import fridge_bp
from ui import views_bp

def create_app():
    """Create and configure the Flask application."""
    static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dist')
    
    app = Flask(__name__, static_folder=static_folder, static_url_path='')
    CORS(app)

    initialize_database()

    app.register_blueprint(user_bp)
    app.register_blueprint(product_bp)
    app.register_blueprint(fridge_bp)
    app.register_blueprint(views_bp)

    return app

def start_react_dev_server():
    """Start React frontend in development mode."""
    frontend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
    subprocess.Popen(["npm", "run", "dev"], cwd=frontend_path, shell=True)

if __name__ == '__main__':
    # Optional: Nur im Dev-Modus React starten
    if os.environ.get("ENV") != "production":
        start_react_dev_server()

    app = create_app()
    app.run(debug=True)
