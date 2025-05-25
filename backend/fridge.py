from flask import Blueprint, request, jsonify, send_file
from database import (
    add_fridge, get_fridges_by_user, get_fridge_by_id,
    update_fridge, delete_fridge,
    store_product_in_fridge, get_contents_of_fridge, remove_product_from_fridge,
    update_fridge_item
)
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import io
from datetime import datetime

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

    success = store_product_in_fridge(
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

    success = update_fridge_item(entry_id, data['menge'], data['haltbarkeit'], data['lagerdatum'])
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

@fridge_bp.route('/<int:fridge_id>/remove/<int:in_fridge_id>', methods=['DELETE'])
def remove_product(fridge_id, in_fridge_id):
    success = remove_product_from_fridge(in_fridge_id, fridge_id)
    if success:
        return jsonify({"message": "Product removed from fridge."}), 200
    return jsonify({"error": "Product not found in fridge or removal failed."}), 404

@fridge_bp.route('/shopping_list', methods=['POST'])
def generate_shopping_list_pdf():
    try:
        shopping_list = request.json
        if not shopping_list:
            return jsonify({"error": "No shopping list data provided."}), 400

        # Create a PDF in memory
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []

        # Add title
        title = Paragraph("Shopping List", styles['Title'])
        elements.append(title)
        elements.append(Spacer(1, 20))

        # Add date
        date = Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal'])
        elements.append(date)
        elements.append(Spacer(1, 20))

        # Prepare table data
        data = [['Item', 'Category', 'Target Fridge', 'Quantity', 'Expected Expiry']]
        for item in shopping_list:
            data.append([
                item['name'],
                item['kategorie'] or 'Uncategorized',
                item['fridge_title'],
                f"{item['menge']} {item['einheit']}",
                item['haltbarkeit'] or 'Not set'
            ])

        # Create table
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))

        elements.append(table)
        doc.build(elements)

        # Prepare the response
        buffer.seek(0)
        return send_file(
            buffer,
            as_attachment=True,
            download_name=f'shopping_list_{datetime.now().strftime("%Y%m%d_%H%M")}.pdf',
            mimetype='application/pdf'
        )

    except Exception as e:
        print(f"Error generating PDF: {str(e)}")
        return jsonify({"error": "Failed to generate PDF."}), 500
