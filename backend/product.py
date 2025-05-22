
from flask import Blueprint, request, jsonify
from database import (
    add_product, get_products_by_user, get_product_by_id,
    update_product, delete_product
)

product_bp = Blueprint('product_bp', __name__, url_prefix='/products')

# Produkt hinzufügen (Create)
@product_bp.route('/', methods=['POST'])
def create_product():
    data = request.json
    required_fields = ['user_id', 'name', 'einheit']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "user_id, name und einheit sind Pflichtfelder."}), 400

    success = add_product(
        data['user_id'],
        data['name'],
        data.get('kategorie', ''),
        data.get('bild_url', ''),
        data['einheit'],
        data.get('barcode_path', '')
    )
    if success:
        return jsonify({"message": "Product created successfully."}), 201
    return jsonify({"error": "Failed to create product."}), 500

# Produkte eines Users abrufen (Read All)
@product_bp.route('/user/<int:user_id>', methods=['GET'])
def get_products(user_id):
    products = get_products_by_user(user_id)
    return jsonify([{
        "product_id": p[0],
        "user_id": p[1],
        "name": p[2],
        "kategorie": p[3],
        "bild_url": p[4],
        "einheit": p[5],
        "barcode_path": p[6]
    } for p in products]), 200

# Produkt per ID abrufen (Read Single)
@product_bp.route('/<int:product_id>', methods=['GET'])
def get_product_by_id_route(product_id):
    p = get_product_by_id(product_id)
    if p:
        return jsonify({
            "product_id": p[0],
            "user_id": p[1],
            "name": p[2],
            "kategorie": p[3],
            "bild_url": p[4],
            "einheit": p[5],
            "barcode_path": p[6]
        }), 200
    return jsonify({"error": "Product not found."}), 404

# Produkt aktualisieren (Update)
@product_bp.route('/<int:product_id>', methods=['PUT'])
def update_product_route(product_id):
    data = request.json
    required_fields = ['name', 'einheit']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "name und einheit sind Pflichtfelder."}), 400

    success = update_product(
        product_id,
        data['name'],
        data.get('kategorie', ''),
        data.get('bild_url', ''),
        data['einheit'],
        data.get('barcode_path', '')
    )
    if success:
        return jsonify({"message": "Product updated successfully."}), 200
    return jsonify({"error": "Product not found or update failed."}), 404

# Produkt löschen (Delete)
@product_bp.route('/<int:product_id>', methods=['DELETE'])
def delete_product_route(product_id):
    success = delete_product(product_id)
    if success:
        return jsonify({"message": "Product deleted successfully."}), 200
    return jsonify({"error": "Product not found or delete failed."}), 404
