import sqlite3
import os

DATABASE_NAME = 'smart_fridge.db'

def create_connection():
    """Create a database connection to a SQLite database."""
    db_path = os.path.join(os.path.dirname(__file__), DATABASE_NAME)
    conn = None
    try:
        conn = sqlite3.connect(db_path)
        return conn
    except sqlite3.Error as e:
        print(e)
    return conn

def initialize_database():
    """Initialize the database with tables if they don't exist."""
    conn = create_connection()
    if conn is not None:
        create_user_table(conn)
        create_product_table(conn)
        create_fridge_table(conn)
        create_fridge_contents_table(conn)
        conn.close()
    else:
        print("Error! cannot create the database connection.")

def create_user_table(conn):
    """Create the user table."""
    try:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL
            )
        """)
        conn.commit()
    except sqlite3.Error as e:
        print(e)

def create_product_table(conn):
    """Create the product table."""
    try:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS product (
                product_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                kategorie TEXT,
                bild_url TEXT,
                einheit TEXT,
                barcode_path TEXT,
                FOREIGN KEY (user_id) REFERENCES user (user_id)
            )
        """)
        conn.commit()
    except sqlite3.Error as e:
        print(e)

def create_fridge_table(conn):
    """Create the fridge table."""
    try:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS fridge (
                fridge_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user (user_id)
            )
        """)
        conn.commit()
    except sqlite3.Error as e:
        print(e)

def create_fridge_contents_table(conn):
    """Create the fridge_contents table."""
    try:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS fridge_contents (
                entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                fridge_id INTEGER NOT NULL,
                menge REAL NOT NULL,
                haltbarkeit DATE,
                lagerdatum DATE,
                FOREIGN KEY (product_id) REFERENCES product (product_id),
                FOREIGN KEY (fridge_id) REFERENCES fridge (fridge_id)
            )
        """)
        conn.commit()
    except sqlite3.Error as e:
        print(e)

# User-related functions
def add_user(username, email, password_hash):
    """Add a new user to the database."""
    conn = create_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO user (username, email, password_hash) VALUES (?, ?, ?)", (username, email, password_hash))
        conn.commit()
        conn.close()
        return True
    except sqlite3.Error as e:
        print(e)
        conn.close()
        return False

def get_user_by_id(user_id):
    """Get a user by user ID."""
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM user WHERE user_id = ?', (user_id,))
    user = cursor.fetchone()
    conn.close()
    return user

def user_exists_by_email(email):
    """Check if a user exists with the given email."""
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT 1 FROM user WHERE email = ?', (email,))
    exists = cursor.fetchone() is not None
    conn.close()
    return exists

# Product-related functions
def add_product(user_id, name, kategorie, bild_url, einheit, barcode_path):
    """Add a new product to the database."""
    conn = create_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO product (user_id, name, kategorie, bild_url, einheit, barcode_path) VALUES (?, ?, ?, ?, ?, ?)",
                       (user_id, name, kategorie, bild_url, einheit, barcode_path))
        conn.commit()
        conn.close()
        return True
    except sqlite3.Error as e:
        print(e)
        conn.close()
        return False

def get_products_by_user(user_id):
    """Get all products for a specific user."""
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM product WHERE user_id = ?', (user_id,))
    products = cursor.fetchall()
    conn.close()
    return products

def get_product_by_id(product_id):
     """Get product by product_id"""
     conn = create_connection()
     cursor = conn.cursor()
     cursor.execute('SELECT * FROM product WHERE product_id = ?', (product_id,))
     product = cursor.fetchone()
     conn.close()
     return product

def update_product(product_id, name, kategorie, bild_url, einheit):
    """Update a product in the database."""
    conn = create_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE product 
            SET name = ?, kategorie = ?, bild_url = ?, einheit = ?
            WHERE product_id = ?
        """, (name, kategorie, bild_url, einheit, product_id))
        conn.commit()
        conn.close()
        return True
    except sqlite3.Error as e:
        print(e)
        conn.close()
        return False

def delete_product(product_id):
    """Delete a product from the database."""
    conn = create_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM product WHERE product_id = ?", (product_id,))
        conn.commit()
        conn.close()
        return True
    except sqlite3.Error as e:
        print(e)
        conn.close()
        return False

# Fridge-related functions
def add_fridge(user_id, title):
    """Add a new fridge to the database."""
    conn = create_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO fridge (user_id, title) VALUES (?, ?)", (user_id, title))
        conn.commit()
        conn.close()
        return True
    except sqlite3.Error as e:
        print(e)
        conn.close()
        return False

def get_fridges_by_user(user_id):
    """Get all fridges for a specific user."""
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM fridge WHERE user_id = ?', (user_id,))
    fridges = cursor.fetchall()
    conn.close()
    return fridges

def get_fridge_by_id(fridge_id):
    """Get a fridge by its ID."""
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM fridge WHERE fridge_id = ?', (fridge_id,))
    fridge = cursor.fetchone()
    conn.close()
    return fridge

def update_fridge(fridge_id, title):
    """Update a fridge in the database."""
    conn = create_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE fridge SET title = ? WHERE fridge_id = ?", (title, fridge_id))
        conn.commit()
        conn.close()
        return True
    except sqlite3.Error as e:
        print(e)
        conn.close()
        return False

def delete_fridge(fridge_id):
    """Delete a fridge from the database."""
    conn = create_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM fridge WHERE fridge_id = ?", (fridge_id,))
        conn.commit()
        conn.close()
        return True
    except sqlite3.Error as e:
        print(e)
        conn.close()
        return False

# Fridge Contents related functions
def add_product_to_fridge(product_id, fridge_id, menge, haltbarkeit, lagerdatum):
    """Add a product to a fridge."""
    conn = create_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO fridge_contents (product_id, fridge_id, menge, haltbarkeit, lagerdatum) VALUES (?, ?, ?, ?, ?)",
                       (product_id, fridge_id, menge, haltbarkeit, lagerdatum))
        conn.commit()
        conn.close()
        return True
    except sqlite3.Error as e:
        print(e)
        conn.close()
        return False

def get_contents_of_fridge(fridge_id):
    """Get all contents of a specific fridge with product details."""
    conn = create_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT 
                fc.entry_id,
                p.product_id,
                p.name,
                p.kategorie,
                p.einheit,
                p.bild_url,
                fc.menge,
                fc.haltbarkeit,
                fc.lagerdatum
            FROM fridge_contents fc
            JOIN product p ON fc.product_id = p.product_id
            WHERE fc.fridge_id = ?
        """, (fridge_id,))
        contents = cursor.fetchall()
        conn.close()
        return contents
    except sqlite3.Error as e:
        print(e)
        conn.close()
        return False

def update_fridge_contents_item(entry_id, menge, haltbarkeit, lagerdatum):
    """Update an item in fridge_contents."""
    conn = create_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE fridge_contents 
            SET menge = ?, haltbarkeit = ?, lagerdatum = ?
            WHERE entry_id = ?
        """, (menge, haltbarkeit, lagerdatum, entry_id))
        conn.commit()
        conn.close()
        return True
    except sqlite3.Error as e:
        print(e)
        conn.close()
        return False

def remove_product_from_fridge(product_id, fridge_id):
    """Remove a product from a fridge."""
    conn = create_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM fridge_contents WHERE product_id = ? AND fridge_id = ?", (product_id, fridge_id))
        conn.commit()
        conn.close()
        return True
    except sqlite3.Error as e:
        print(e)
        conn.close()
        return False

def get_user_by_email(email):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM user WHERE email = ?', (email,))
    user = cursor.fetchone()
    conn.close()
    return user
