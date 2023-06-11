import os
from app import app
from flask import jsonify
import supply
import config


@app.route("/", methods=["GET"])
def index():
    return jsonify({"root": True}), 200


@app.errorhandler(404)
def notfound(e):
    return jsonify({"message": "not found"}), 404


@app.errorhandler(500)
def internalserver_error(e):
    return jsonify({"message": "Internal Server Error"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=os.environ.get("FLASK_SERVER_PORT", 9090))