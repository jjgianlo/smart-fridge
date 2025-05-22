
"""
Main entry point for the Smart Fridge application.
Handles application initialization and configuration.
"""

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
    app = Flask(__name__)
    CORS(app)  # Enable CORS for all routes
    
    # Initialize database
    initialize_database()
    
    # Register blueprints
    app.register_blueprint(user_bp)
    app.register_blueprint(product_bp)
    app.register_blueprint(fridge_bp)
    app.register_blueprint(views_bp)
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
