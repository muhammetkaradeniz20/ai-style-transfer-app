from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

app = Flask(__name__)
CORS(app)

def apply_sepia(image):
    width, height = image.size
    pixels = image.load()
    for py in range(height):
        for px in range(width):
            r, g, b = pixels[px, py]
            tr = int(0.393 * r + 0.769 * g + 0.189 * b)
            tg = int(0.349 * r + 0.686 * g + 0.168 * b)
            tb = int(0.272 * r + 0.534 * g + 0.131 * b)
            pixels[px, py] = (min(255, tr), min(255, tg), min(255, tb))
    return image

def apply_cartoon(image):
    edge = image.convert("L").filter(ImageFilter.FIND_EDGES)
    edge = edge.point(lambda x: 0 if x < 100 else 255)
    edge = edge.convert("1")
    img_posterized = ImageOps.posterize(image, bits=3)
    img_blurred = img_posterized.filter(ImageFilter.MedianFilter(size=3))
    img_blurred.paste((0, 0, 0), mask=edge)
    return img_blurred

def process_image(base64_img, operation):
    img_data = base64.b64decode(base64_img.split(",")[1])
    image = Image.open(io.BytesIO(img_data)).convert("RGB")

    if operation == "grayscale":
        image = image.convert("L").convert("RGB")
    elif operation == "enhance":
        enhancer = ImageEnhance.Color(image)
        image = enhancer.enhance(2.0)
    elif operation == "blur":
        # Daha güçlü bulanıklaştırma
        image = image.filter(ImageFilter.GaussianBlur(radius=7))
    elif operation == "mirror":
        image = image.transpose(Image.FLIP_LEFT_RIGHT)
    elif operation == "sepia":
        image = apply_sepia(image)
    elif operation == "cartoon":
        image = apply_cartoon(image)
    elif operation == "negative":
        image = ImageOps.invert(image)
    elif operation == "brightness":
        enhancer = ImageEnhance.Brightness(image)
        image = enhancer.enhance(1.5)
    else:
        return None

    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")

@app.route("/transform", methods=["POST"])
def transform():
    try:
        data = request.get_json()
        base64_img = data["image"]
        operation = data["style"]

        result = process_image(base64_img, operation)

        if result is None:
            return jsonify({"error": "Geçersiz işlem seçildi."}), 400

        return jsonify({"result": result})

    except Exception as e:
        print(f"HATA: {str(e)}")
        return jsonify({"error": "Stil dönüşümünden veri alınamadı."}), 500

if __name__ == "__main__":
    app.run(debug=True)
