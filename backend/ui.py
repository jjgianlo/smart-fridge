
from flask import Blueprint, render_template, request, redirect, url_for
import requests

views_bp = Blueprint('views', __name__)

@views_bp.route('/')
def login():
    """Render the login page."""
    return render_template('login.html')

@views_bp.route('/fridges', methods=['GET', 'POST'])
def show_fridges():
    """Handle login POST and display all fridges."""
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        # Optional: hier kannst du echte Authentifizierung anstoßen
        print(f"Login attempt: {email} / {password}")  # für Debug
        return redirect(url_for('views.show_fridges'))  # Weiterleitung nach Login

    # GET: Fridge anzeigen
    response = requests.get('http://localhost:5000/fridges/user/1')
    fridges = response.json() if response.status_code == 200 else []
    return render_template('fridges.html', fridges=fridges)

@views_bp.route('/fridge/<int:fridge_id>')
def fridge_contents(fridge_id):
    """Display contents of a specific fridge."""
    response = requests.get(f'http://localhost:5000/fridges/{fridge_id}/contents')
    fridge = response.json() if response.status_code == 200 else []
    return render_template('fridge_contents.html', fridge=fridge, fridge_id=fridge_id)

@views_bp.route('/products')
def all_products():
    """Display all products for the current user."""
    response = requests.get('http://localhost:5000/products/user/1')
    products = response.json() if response.status_code == 200 else []
    return render_template('products.html', products=products)

@views_bp.route('/shopping-list', methods=['POST'])
def create_shopping_list():
    """Create a shopping list from selected products."""
    selected = request.form.getlist('product')
    return render_template('shopping_list.html', selected=selected)
