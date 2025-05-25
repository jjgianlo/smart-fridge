from flask import Blueprint, request, jsonify, render_template, redirect, url_for, flash, session
from flask_cors import CORS
import requests
import os
from database import get_user_by_email, get_fridges_by_user, get_products_by_user, get_contents_of_fridge

views_bp = Blueprint('views', __name__, template_folder='../templates', static_folder='../static')
CORS(views_bp, origins=["http://127.0.0.1:5000"])

# Main routes
@views_bp.route('/')
def index():
    """Render the login page if not authenticated, otherwise redirect to products."""
    if 'user_id' in session:
        return redirect(url_for('views.products'))
    return redirect(url_for('views.login'))

@views_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Handle login requests."""
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        # Simple authentication - in a real app, you'd validate the password
        user = get_user_by_email(email)
        
        if user:
            session['user_id'] = user[0]
            session['username'] = user[1]
            session['email'] = user[2]
            flash('Login successful!', 'success')
            return redirect(url_for('views.products'))
        else:
            flash('Invalid credentials', 'error')
    
    return render_template('login.html')

@views_bp.route('/register', methods=['GET', 'POST'])
def register():
    """Handle user registration."""
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        
        # Add user to database
        response = requests.post('http://localhost:5000/users/', json={
            'username': username,
            'email': email,
            'password_hash': password
        })
        
        if response.status_code == 201:
            flash('Registration successful! Please log in.', 'success')
            return redirect(url_for('views.login'))
        else:
            flash('Registration failed. Email might already exist.', 'error')
    
    return render_template('register.html')

@views_bp.route('/logout')
def logout():
    """Log out the user."""
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('views.login'))

@views_bp.route('/products')
def products():
    """Display all products for the current user."""
    if 'user_id' not in session:
        return redirect(url_for('views.login'))
    
    user_id = session['user_id']
    products = get_products_by_user(user_id)
    
    # Convert products to list of dicts for template
    products_list = [{
        'product_id': p[0],
        'user_id': p[1],
        'name': p[2],
        'kategorie': p[3],
        'bild_url': p[4],
        'einheit': p[5],
        'barcode_path': p[6]
    } for p in products]
    
    return render_template('products.html', products=products_list, user=session)

@views_bp.route('/fridges')
def fridges():
    """Display all fridges for the current user."""
    if 'user_id' not in session:
        return redirect(url_for('views.login'))
    
    user_id = session['user_id']
    fridges = get_fridges_by_user(user_id)
    
    # Convert fridges to list of dicts for template
    fridges_list = [{
        'fridge_id': f[0],
        'user_id': f[1],
        'title': f[2]
    } for f in fridges]
    
    return render_template('fridges.html', fridges=fridges_list, user=session)

@views_bp.route('/fridge/<int:fridge_id>')
def fridge_details(fridge_id):
    """Display contents of a specific fridge."""
    if 'user_id' not in session:
        return redirect(url_for('views.login'))
    
    contents = get_contents_of_fridge(fridge_id)
    
    # Convert contents to list of dicts for template
    contents_list = [{
        'entry_id': c[0],
        'product_id': c[1],
        'name': c[2],
        'kategorie': c[3],
        'einheit': c[4],
        'bild_url': c[5],
        'menge': c[6],
        'haltbarkeit': c[7],
        'lagerdatum': c[8]
    } for c in contents]
    
    return render_template('fridge_details.html', contents=contents_list, fridge_id=fridge_id, user=session)

# API endpoints for AJAX requests
@views_bp.route('/api/health')
def health_check():
    """Simple health check endpoint."""
    return jsonify({"status": "ok", "message": "Service is running"}), 200
