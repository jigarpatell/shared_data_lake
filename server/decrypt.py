from flask import Flask, request, jsonify
from cryptography.fernet import Fernet, InvalidToken
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Function to decrypt data
def decrypt_data(data, key):
    try:
        # Remove b' from the start and ' from the end of the key
        key = key.strip("b'").strip("'")
        cipher_suite = Fernet(key)
        decrypted_data = cipher_suite.decrypt(data.encode()).decode()
        return decrypted_data
    except InvalidToken:
        print("Invalid token provided for decryption.")
        return None

@app.route('/decrypt-value', methods=['GET'])
def decrypt_value():
    encryption_key = request.args.get('encryption_key')
    encrypted_value = request.args.get('encrypted_value')

    if not encryption_key or not encrypted_value:
        return jsonify({"error": "Encryption key or encrypted value missing"}), 400

    # Decrypt the value
    decrypted_value = decrypt_data(encrypted_value, encryption_key)

    if decrypted_value is None:
        return jsonify({"error": "Failed to decrypt value"}), 500

    return jsonify({"decrypted_value": decrypted_value})

if __name__ == '__main__':
    app.run(debug=True, port=5003)
