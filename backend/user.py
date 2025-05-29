from flask import Blueprint, request, jsonify
from database import add_user, get_user_by_credentials, get_user_by_id, user_exists_by_email, create_connection

user_bp = Blueprint('user_bp', __name__, url_prefix='/users')

@user_bp.route('/', methods=['POST'])
def create_user():
    data = request.json
    if user_exists_by_email(data['email']):
        return jsonify({"error": "E-Mail already exists."}), 409

    success = add_user(data['username'], data['email'], data['password'])
    if success:
        return jsonify({"message": "User created successfully."}), 201
    return jsonify({"error": "User creation failed."}), 500

@user_bp.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    user = get_user_by_credentials(email, password)
    
    if user:
        user_data = {
            "user_id": user[0],
            "username": user[1],
            "email": user[2]
        }
        return jsonify(user_data), 200
    
    return jsonify({"error": "Invalid email or password"}), 401

@user_bp.route('/id/<int:user_id>', methods=['GET'])
def read_user_by_id(user_id):
    user = get_user_by_id(user_id)
    if user:
        return jsonify({
            "user_id": user[0],
            "username": user[1],
            "email": user[2]
        }), 200
    return jsonify({"error": "User not found."}), 404

@user_bp.route('/<username>', methods=['PUT'])
def update_user(username):
    data = request.json
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE user SET email = ?, password_hash = ? WHERE username = ?
    ''', (data['email'], data['password_hash'], username))
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({"error": "User not found."}), 404
    conn.commit()
    conn.close()
    return jsonify({"message": "User updated successfully."}), 200

@user_bp.route('/<username>', methods=['DELETE'])
def delete_user(username):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM user WHERE username = ?', (username,))
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({"error": "User not found."}), 404
    conn.commit()
    conn.close()
    return jsonify({"message": "User deleted successfully."}), 200
