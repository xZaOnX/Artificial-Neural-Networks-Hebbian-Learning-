from flask import Flask, jsonify, request

from vercel_api import get_gallery_payload, run_recall

app = Flask(__name__)


@app.get("/api/gallery")
def gallery():
    lang = request.args.get("lang", "en")
    return jsonify(get_gallery_payload(lang))


@app.post("/api/recall")
def recall():
    payload = request.get_json(silent=True) or {}

    try:
        return jsonify(run_recall(payload))
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5328, debug=False)
