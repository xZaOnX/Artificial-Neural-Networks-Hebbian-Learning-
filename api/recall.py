from flask import Flask, jsonify, request

from vercel_api import run_recall

app = Flask(__name__)


@app.route("/", defaults={"path": ""}, methods=["POST"])
@app.route("/<path:path>", methods=["POST"])
def recall(path: str):
    payload = request.get_json(silent=True) or {}

    try:
        return jsonify(run_recall(payload))
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
