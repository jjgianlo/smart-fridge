
import sqlite3
from sqlite3 import Error

DATABASE_FILE = 'smart_fridge.db'

def create_connection():
    conn = None
    try:
        conn = sqlite3.connect(DATABASE_FILE)
        conn.execute("PRAGMA foreign_keys = ON")  # Enable foreign key constraints
    except Error as e:
        print(e)
    return conn

def initialize_database():
    conn = create_connection()
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL
        );
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS fridge (
            fridge_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES user(user_id) ON DELETE CASCADE
        );
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS product (
            product_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            kategorie TEXT,
            bild_url TEXT,
            einheit TEXT,
            barcode_path TEXT,
            FOREIGN KEY(user_id) REFERENCES user(user_id) ON DELETE CASCADE
        );
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS in_fridge (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            fridge_id INTEGER NOT NULL,
            menge REAL NOT NULL,
            haltbarkeit TEXT,
            lagerdatum TEXT,
            FOREIGN KEY(product_id) REFERENCES product(product_id) ON DELETE CASCADE,
            FOREIGN KEY(fridge_id) REFERENCES fridge(fridge_id) ON DELETE CASCADE
        );
    ''')

    # Beispiel-Daten einfügen, wenn Tabellen leer sind
    cursor.execute('SELECT COUNT(*) FROM user')
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO user (username, email, password_hash) VALUES (?, ?, ?)",
                    ('Max Mustermann', 'max@example.com', 'geheim123'))

    cursor.execute('SELECT COUNT(*) FROM fridge')
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO fridge (user_id, title) VALUES (?, ?)", (1, 'Kitchen Fridge'))
        cursor.execute("INSERT INTO fridge (user_id, title) VALUES (?, ?)", (1, 'Garage Fridge'))

    cursor.execute('SELECT COUNT(*) FROM product')
    if cursor.fetchone()[0] == 0:
        cursor.execute('''INSERT INTO product (user_id, name, kategorie, bild_url, einheit, barcode_path)
                        VALUES (?, ?, ?, ?, ?, ?)''',
                    (1, 'Milk', 'Dairy', 'https://example.com/milk.jpg', 'L', ''))
        cursor.execute('''INSERT INTO product (user_id, name, kategorie, bild_url, einheit, barcode_path)
                        VALUES (?, ?, ?, ?, ?, ?)''',
                    (1, 'Cheese', 'Dairy', 'https://example.com/cheese.jpg', 'kg', ''))
        cursor.execute('''INSERT INTO product (user_id, name, kategorie, bild_url, einheit, barcode_path)
                        VALUES (?, ?, ?, ?, ?, ?)''',
                    (1, 'Apples', 'Fruit', 'https://example.com/apples.jpg', 'pcs', ''))

    cursor.execute('SELECT COUNT(*) FROM in_fridge')
    if cursor.fetchone()[0] == 0:
        cursor.execute('''INSERT INTO in_fridge (product_id, fridge_id, menge, haltbarkeit, lagerdatum)
                        VALUES (?, ?, ?, ?, ?)''',
                    (1, 1, 1.0, '2025-06-05', '2025-05-20'))
        cursor.execute('''INSERT INTO in_fridge (product_id, fridge_id, menge, haltbarkeit, lagerdatum)
                        VALUES (?, ?, ?, ?, ?)''',
                    (2, 1, 0.5, '2025-06-10', '2025-05-21'))
        cursor.execute('''INSERT INTO in_fridge (product_id, fridge_id, menge, haltbarkeit, lagerdatum)
                        VALUES (?, ?, ?, ?, ?)''',
                    (3, 1, 5, '2025-05-27', '2025-05-21'))

    conn.commit()
    conn.close()

def add_user(username, email, password_hash):
    try:
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO user (username, email, password_hash) VALUES (?, ?, ?)',
                       (username, email, password_hash))
        conn.commit()
        return True
    except Error as e:
        print(f"[add_user] Fehler: {e}")
        return False
    finally:
        conn.close()

def get_user_by_email(email):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM user WHERE email = ?', (email,))
    user = cursor.fetchone()
    conn.close()
    return user

def get_user_by_id(user_id):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM user WHERE user_id = ?', (user_id,))
    user = cursor.fetchone()
    conn.close()
    return user

def add_fridge(user_id, title):
    try:
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO fridge (user_id, title) VALUES (?, ?)', (user_id, title))
        conn.commit()
        return True
    except Error as e:
        print(f"[add_fridge] Fehler: {e}")
        return False
    finally:
        conn.close()

def get_fridges_by_user(user_id):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM fridge WHERE user_id = ?', (user_id,))
    fridges = cursor.fetchall()
    conn.close()
    return fridges

def get_fridge_by_id(fridge_id):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM fridge WHERE fridge_id = ?', (fridge_id,))
    fridge = cursor.fetchone()
    conn.close()
    return fridge

def update_fridge(fridge_id, title):
    try:
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE fridge SET title = ? WHERE fridge_id = ?', (title, fridge_id))
        if cursor.rowcount == 0:
            return False
        conn.commit()
        return True
    except Error as e:
        print(f"[update_fridge] Fehler: {e}")
        return False
    finally:
        conn.close()

def delete_fridge(fridge_id):
    try:
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM fridge WHERE fridge_id = ?', (fridge_id,))
        if cursor.rowcount == 0:
            return False
        conn.commit()
        return True
    except Error as e:
        print(f"[delete_fridge] Fehler: {e}")
        return False
    finally:
        conn.close()

def add_product(user_id, name, kategorie, bild_url, einheit, barcode_path):
    try:
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO product (user_id, name, kategorie, bild_url, einheit, barcode_path)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (user_id, name, kategorie, bild_url, einheit, barcode_path))
        conn.commit()
        return True
    except Error as e:
        print(f"[add_product] Fehler: {e}")
        return False
    finally:
        conn.close()

def get_products_by_user(user_id):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM product WHERE user_id = ?', (user_id,))
    products = cursor.fetchall()
    conn.close()
    return products

def get_product_by_id(product_id):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM product WHERE product_id = ?', (product_id,))
    product = cursor.fetchone()
    conn.close()
    return product

def update_product(product_id, name, kategorie, bild_url, einheit, barcode_path):
    try:
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE product
            SET name = ?, kategorie = ?, bild_url = ?, einheit = ?, barcode_path = ?
            WHERE product_id = ?
        ''', (name, kategorie, bild_url, einheit, barcode_path, product_id))
        if cursor.rowcount == 0:
            return False
        conn.commit()
        return True
    except Error as e:
        print(f"[update_product] Fehler: {e}")
        return False
    finally:
        conn.close()

def delete_product(product_id):
    try:
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM product WHERE product_id = ?', (product_id,))
        if cursor.rowcount == 0:
            return False
        conn.commit()
        return True
    except Error as e:
        print(f"[delete_product] Fehler: {e}")
        return False
    finally:
        conn.close()

def store_product_in_fridge(product_id, fridge_id, menge, haltbarkeit, lagerdatum):
    try:
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO in_fridge (product_id, fridge_id, menge, haltbarkeit, lagerdatum)
            VALUES (?, ?, ?, ?, ?)
        ''', (product_id, fridge_id, menge, haltbarkeit, lagerdatum))
        conn.commit()
        return True
    except Error as e:
        print(f"[store_product_in_fridge] Fehler: {e}")
        return False
    finally:
        conn.close()

def update_fridge_item(entry_id, menge, haltbarkeit, lagerdatum):
    try:
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE in_fridge
            SET menge = ?, haltbarkeit = ?, lagerdatum = ?
            WHERE id = ?
        ''', (menge, haltbarkeit, lagerdatum, entry_id))
        if cursor.rowcount == 0:
            return False
        conn.commit()
        return True
    except Error as e:
        print(f"[update_fridge_item] Fehler: {e}")
        return False
    finally:
        conn.close()

def get_contents_of_fridge(fridge_id):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT f.id, p.product_id, p.name, p.kategorie, p.einheit, p.bild_url, f.menge, f.haltbarkeit, f.lagerdatum
        FROM in_fridge f
        JOIN product p ON f.product_id = p.product_id
        WHERE f.fridge_id = ?
    ''', (fridge_id,))
    contents = cursor.fetchall()
    conn.close()
    return contents

def remove_product_from_fridge(product_id, fridge_id):
    try:
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM in_fridge WHERE product_id = ? AND fridge_id = ?', (product_id, fridge_id))
        if cursor.rowcount == 0:
            return False
        conn.commit()
        return True
    except Error as e:
        print(f"[remove_product_from_fridge] Fehler: {e}")
        return False
    finally:
        conn.close()

def user_exists_by_email(email):
    try:
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM user WHERE email = ?', (email,))
        result = cursor.fetchone()
        return result is not None
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()
