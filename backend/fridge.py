
from flask import Blueprint, request, jsonify
from database import (
    add_fridge, get_fridges_by_user, get_fridge_by_id,
    update_fridge, delete_fridge,
    add_product_to_fridge, get_contents_of_fridge, remove_product_from_fridge,
    update_fridge_contents_item
)

fridge_bp = Blueprint('fridge_bp', __name__, url_prefix='/fridges')

@fridge_bp.route('/', methods=['POST'])
def create_fridge():
    data = request.json
    if not data.get('user_id') or not data.get('title'):
        return jsonify({"error": "user_id and title are required."}), 400

    success = add_fridge(data['user_id'], data['title'])
    if success:
        return jsonify({"message": "Fridge created successfully."}), 201
    return jsonify({"error": "Failed to create fridge."}), 500

@fridge_bp.route('/user/<int:user_id>', methods=['GET'])
def get_fridges(user_id):
    fridges = get_fridges_by_user(user_id)
    return jsonify([
        {"fridge_id": f[0], "user_id": f[1], "title": f[2]} for f in fridges
    ]), 200

@fridge_bp.route('/<int:fridge_id>', methods=['GET'])
def get_fridge_by_id_route(fridge_id):
    fridge = get_fridge_by_id(fridge_id)
    if fridge:
        return jsonify({"fridge_id": fridge[0], "user_id": fridge[1], "title": fridge[2]}), 200
    return jsonify({"error": "Fridge not found."}), 404

@fridge_bp.route('/<int:fridge_id>', methods=['PUT'])
def update_fridge_route(fridge_id):
    data = request.json
    if not data.get('title'):
        return jsonify({"error": "title is required."}), 400

    success = update_fridge(fridge_id, data['title'])
    if success:
        return jsonify({"message": "Fridge updated successfully."}), 200
    return jsonify({"error": "Fridge not found or update failed."}), 404

@fridge_bp.route('/<int:fridge_id>', methods=['DELETE'])
def delete_fridge_route(fridge_id):
    success = delete_fridge(fridge_id)
    if success:
        return jsonify({"message": "Fridge deleted successfully."}), 200
    return jsonify({"error": "Fridge not found or delete failed."}), 404

@fridge_bp.route('/<int:fridge_id>/store', methods=['POST'])
def store_product(fridge_id):
    data = request.json
    required_fields = ['product_id', 'menge']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "product_id and menge are required."}), 400

    haltbarkeit = data.get('haltbarkeit', '')
    lagerdatum = data.get('lagerdatum', '')

    success = add_product_to_fridge(
        data['product_id'], fridge_id, data['menge'], haltbarkeit, lagerdatum
    )
    if success:
        return jsonify({"message": "Product stored in fridge."}), 200
    return jsonify({"error": "Failed to store product."}), 500

@fridge_bp.route('/update_item/<int:entry_id>', methods=['PUT'])
def update_fridge_entry(entry_id):
    data = request.json
    if not all(k in data for k in ['menge', 'haltbarkeit', 'lagerdatum']):
        return jsonify({"error": "menge, haltbarkeit and lagerdatum required."}), 400

    success = update_fridge_contents_item(entry_id, data['menge'], data['haltbarkeit'], data['lagerdatum'])
    if success:
        return jsonify({"message": "Fridge item updated."}), 200
    return jsonify({"error": "Entry not found or update failed."}), 404

@fridge_bp.route('/<int:fridge_id>/contents', methods=['GET'])
def get_fridge_contents(fridge_id):
    contents = get_contents_of_fridge(fridge_id)
    return jsonify([
        {
            "entry_id": c[0],
            "product_id": c[1],
            "name": c[2],
            "kategorie": c[3],
            "einheit": c[4],
            "bild_url": c[5],
            "menge": c[6],
            "haltbarkeit": c[7],
            "lagerdatum": c[8]
        } for c in contents
    ]), 200

@fridge_bp.route('/<int:fridge_id>/remove/<int:product_id>', methods=['DELETE'])
def remove_product(fridge_id, product_id):
    success = remove_product_from_fridge(product_id, fridge_id)
    if success:
        return jsonify({"message": "Product removed from fridge."}), 200
    return jsonify({"error": "Product not found in fridge or removal failed."}), 404
