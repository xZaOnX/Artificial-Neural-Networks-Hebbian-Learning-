from flask import Flask, jsonify, request

from vercel_api import get_gallery_payload

app = Flask(__name__)


@app.route("/", defaults={"path": ""}, methods=["GET"])
@app.route("/<path:path>", methods=["GET"])
def gallery(path: str):
    lang = request.args.get("lang", "en")
    return jsonify(get_gallery_payload(lang))
