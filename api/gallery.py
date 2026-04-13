from flask import Flask, jsonify, request

from vercel_api import get_gallery_payload

app = Flask(__name__)


@app.route("/", methods=["GET"])
def gallery():
    lang = request.args.get("lang", "en")
    return jsonify(get_gallery_payload(lang))
