# import os
# from flask import current_app, send_from_directory
# from werkzeug.utils import secure_filename

# import io
# from typing import List, Dict, Any
# import json

# from PIL import Image, ImageDraw
# import numpy as np
# import torch
# from torchvision.ops import box_convert
# from transformers import DetrFeatureExtractor, DetrForObjectDetection
# from collections import Counter
# from webcolors import rgb_to_name

# # Define a custom dictionary for CSS3 color names and HEX values
# CSS3_NAMES_TO_HEX = {
#     "aliceblue": "#f0f8ff",
#     "antiquewhite": "#faebd7",
#     "aqua": "#00ffff",
#     "aquamarine": "#7fffd4",
#     "azure": "#f0ffff",
#     "beige": "#f5f5dc",
#     "bisque": "#ffe4c4",
#     "black": "#000000",
#     "blanchedalmond": "#ffebcd",
#     "blue": "#0000ff",
#     "blueviolet": "#8a2be2",
#     "brown": "#a52a2a",
#     "burlywood": "#deb887",
#     "cadetblue": "#5f9ea0",
#     "chartreuse": "#7fff00",
#     "chocolate": "#d2691e",
#     "coral": "#ff7f50",
#     "cornflowerblue": "#6495ed",
#     "cornsilk": "#fff8dc",
#     "crimson": "#dc143c",
#     "cyan": "#00ffff",
#     "darkblue": "#00008b",
#     "darkcyan": "#008b8b",
#     "darkgoldenrod": "#b8860b",
#     "darkgray": "#a9a9a9",
#     "darkgreen": "#006400",
#     "darkkhaki": "#bdb76b",
#     "darkmagenta": "#8b008b",
#     "darkolivegreen": "#556b2f",
#     "darkorange": "#ff8c00",
#     "darkorchid": "#9932cc",
#     "darkred": "#8b0000",
#     "darksalmon": "#e9967a",
#     "darkseagreen": "#8fbc8f",
#     "darkslateblue": "#483d8b",
#     "darkslategray": "#2f4f4f",
#     "darkturquoise": "#00ced1",
#     "darkviolet": "#9400d3",
#     "deeppink": "#ff1493",
#     "deepskyblue": "#00bfff",
#     "dimgray": "#696969",
#     "dodgerblue": "#1e90ff",
#     "firebrick": "#b22222",
#     "floralwhite": "#fffaf0",
#     "forestgreen": "#228b22",
#     "fuchsia": "#ff00ff",
#     "gainsboro": "#dcdcdc",
#     "ghostwhite": "#f8f8ff",
#     "gold": "#ffd700",
#     "goldenrod": "#daa520",
#     "gray": "#808080",
#     "green": "#008000",
#     "greenyellow": "#adff2f",
#     "honeydew": "#f0fff0",
#     "hotpink": "#ff69b4",
#     "indianred": "#cd5c5c",
#     "indigo": "#4b0082",
#     "ivory": "#fffff0",
#     "khaki": "#f0e68c",
#     "lavender": "#e6e6fa",
#     "lavenderblush": "#fff0f5",
#     "lawngreen": "#7cfc00",
#     "lemonchiffon": "#fffacd",
#     "lightblue": "#add8e6",
#     "lightcoral": "#f08080",
#     "lightcyan": "#e0ffff",
#     "lightgoldenrodyellow": "#fafad2",
#     "lightgray": "#d3d3d3",
#     "lightgreen": "#90ee90",
#     "lightpink": "#ffb6c1",
#     "lightsalmon": "#ffa07a",
#     "lightseagreen": "#20b2aa",
#     "lightskyblue": "#87cefa",
#     "lightslategray": "#778899",
#     "lightsteelblue": "#b0c4de",
#     "lightyellow": "#ffffe0",
#     "lime": "#00ff00",
#     "limegreen": "#32cd32",
#     "linen": "#faf0e6",
#     "magenta": "#ff00ff",
#     "maroon": "#800000",
#     "mediumaquamarine": "#66cdaa",
#     "mediumblue": "#0000cd",
#     "mediumorchid": "#ba55d3",
#     "mediumpurple": "#9370db",
#     "mediumseagreen": "#3cb371",
#     "mediumslateblue": "#7b68ee",
#     "mediumspringgreen": "#00fa9a",
#     "mediumturquoise": "#48d1cc",
#     "mediumvioletred": "#c71585",
#     "midnightblue": "#191970",
#     "mintcream": "#f5fffa",
#     "mistyrose": "#ffe4e1",
#     "moccasin": "#ffe4b5",
#     "navajowhite": "#ffdead",
#     "navy": "#000080",
#     "oldlace": "#fdf5e6",
#     "olive": "#808000",
#     "olivedrab": "#6b8e23",
#     "orange": "#ffa500",
#     "orangered": "#ff4500",
#     "orchid": "#da70d6",
#     "palegoldenrod": "#eee8aa",
#     "palegreen": "#98fb98",
#     "paleturquoise": "#afeeee",
#     "palevioletred": "#db7093",
#     "papayawhip": "#ffefd5",
#     "peachpuff": "#ffdab9",
#     "peru": "#cd853f",
#     "pink": "#ffc0cb",
#     "plum": "#dda0dd",
#     "powderblue": "#b0e0e6",
#     "purple": "#800080",
#     "red": "#ff0000",
#     "rosybrown": "#bc8f8f",
#     "royalblue": "#4169e1",
#     "saddlebrown": "#8b4513",
#     "salmon": "#fa8072",
#     "sandybrown": "#f4a460",
#     "seagreen": "#2e8b57",
#     "seashell": "#fff5ee",
#     "sienna": "#a0522d",
#     "silver": "#c0c0c0",
#     "skyblue": "#87ceeb",
#     "slateblue": "#6a5acd",
#     "slategray": "#708090",
#     "snow": "#fffafa",
#     "springgreen": "#00ff7f",
#     "steelblue": "#4682b4",
#     "tan": "#d2b48c",
#     "teal": "#008080",
#     "thistle": "#d8bfd8",
#     "tomato": "#ff6347",
#     "turquoise": "#40e0d0",
#     "violet": "#ee82ee",
#     "wheat": "#f5deb3",
#     "white": "#ffffff",
#     "whitesmoke": "#f5f5f5",
#     "yellow": "#ffff00",
#     "yellowgreen": "#9acd32"
# }


# # ============================================================
# # 🔹 CONFIGURAZIONE E UTILITY
# # ============================================================

# def _get_upload_dir():
#     """
#     Restituisce la directory dove salvare i file e la crea se non esiste.
#     """
#     upload_dir = current_app.config.get('UPLOAD_FOLDER', os.path.join(os.getcwd(), 'uploads'))
#     os.makedirs(upload_dir, exist_ok=True)
#     return upload_dir


# def _allowed_file(filename: str) -> bool:
#     """
#     Controlla se il file ha un'estensione valida.
#     """
#     allowed = current_app.config.get('ALLOWED_EXTENSIONS', {'png', 'jpg', 'jpeg', 'gif'})
#     return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed



# # ============================================================
# # 🔹 FUNZIONE: RESTITUZIONE IMMAGINE
# # ============================================================

# def classify_image(filename: str):
#     """
#     Restituisce il file immagine richiesto se esiste.
#     """
#     upload_dir = _get_upload_dir()
#     file_path = os.path.join(upload_dir, filename)

#     if not os.path.exists(file_path):
#         return {
#             "code": 404,
#             "message": f"File '{filename}' non trovato.",
#             "data": None
#         }

#     return send_from_directory(upload_dir, filename)


# #####




# async def analyze_image(filename: str):
#     # Load DETR-fashionpedia model & processor
#     MODEL_ID = "fedirky/detr-fashionpedia"
#     feature_extractor = DetrFeatureExtractor.from_pretrained(MODEL_ID)
#     model = DetrForObjectDetection.from_pretrained(MODEL_ID)
#     model.eval()

#     # Load image from the filesystem
#     upload_dir = _get_upload_dir()
#     file_path = os.path.join(upload_dir, filename)

#     if not os.path.exists(file_path):
#         return {
#             "code": 404,
#             "message": f"File '{filename}' non trovato.",
#             "data": None
#         }

#     # Open the image file
#     try:
#         with open(file_path, "rb") as f:
#             image = Image.open(f).convert("RGB")
#     except Exception as e:
#         current_app.logger.error(f"Errore durante l'apertura dell'immagine: {e}")
#         return {
#             "code": 500,
#             "message": "Errore durante l'apertura dell'immagine.",
#             "data": None
#         }

#     # Preprocess
#     inputs = feature_extractor(images=image, return_tensors="pt")
#     with torch.no_grad():
#         outputs = model(**inputs)

#     # Parse outputs
#     logits = outputs.logits  # shape (batch_size=1, num_queries, num_labels)
#     pred_boxes = outputs.pred_boxes  # normalized

#     # Convert boxes to absolute coordinates
#     w, h = image.size
#     boxes = box_convert(pred_boxes[0], in_fmt="cxcywh", out_fmt="xyxy")
#     boxes = boxes * torch.tensor([w, h, w, h], dtype=torch.float)

#     scores = logits.softmax(-1)[0, :, :-1]  # skip the “no-object” class
#     labels = torch.argmax(scores, dim=-1)
#     confidences = torch.max(scores, dim=-1).values

#     results = []
#     for box, label, conf in zip(boxes, labels, confidences):
#         # Filter low confidence
#         if conf < 0.15:
#             continue
#         box = box.cpu().tolist()
#         label_id = int(label.item())
#         label_name = model.config.id2label[label_id]

#         # Extract clothing attributes
#         attributes = extract_clothing_attributes(image, box)

#         results.append({
#             "bbox": {"xmin": box[0], "ymin": box[1], "xmax": box[2], "ymax": box[3]},
#             "category_id": label_id,
#             "category_name": label_name,
#             "confidence": float(conf.item()),
#             "attributes": attributes  # Add extracted attributes
#         })

#     # Voting system: Count occurrences of objects based on their attributes
#     attribute_counter = Counter(
#         json.dumps(obj["attributes"]) for obj in results
#     )

#     # Find the most common object
#     most_common_attributes, count = attribute_counter.most_common(1)[0]
#     most_common_object = json.loads(most_common_attributes)

#     # Add the count to the result for debugging or additional information
#     most_common_object["count"] = count

#     return {"most_common_object": most_common_object}


# def extract_clothing_attributes(image: Image.Image, bbox: List[float]) -> Dict[str, Any]:
#     """
#     Extracts clothing attributes (e.g., color, material, fit, pattern, type) from the bounding box region.
#     """
#     # Crop the bounding box region
#     xmin, ymin, xmax, ymax = map(int, bbox)
#     cropped_image = image.crop((xmin, ymin, xmax, ymax))

#     # Extract primary and secondary colors
#     primary_color, secondary_color = detect_colors(cropped_image)

#     # Determine clothing type
#     clothing_type = detect_clothing_type(cropped_image)

#     # Placeholder logic for material, fit, and pattern
#     # These would require additional models or heuristics
#     material = "cotton"  # Example: Replace with material detection logic
#     fit = "regular"  # Example: Replace with fit detection logic
#     pattern = "striped"  # Example: Replace with pattern detection logic

#     return {
#         "primary_color": primary_color,
#         "secondary_color": secondary_color,
#         "material": material,
#         "fit": fit,
#         "pattern": pattern,
#         "type": clothing_type  # Add clothing type
#     }


# def detect_colors(image: Image.Image) -> (str, str):
#     """
#     Detects the primary and secondary colors in the image.
#     """
#     # Resize the image to reduce computation
#     image = image.resize((50, 50))
#     pixels = np.array(image).reshape(-1, 3)  # Flatten the image into RGB values

#     # Count the most common colors
#     pixel_counts = Counter([tuple(pixel) for pixel in pixels])
#     most_common = pixel_counts.most_common(2)

#     # Convert RGB to color names (you can use a library like `webcolors` for better results)
#     primary_color = rgb_to_color_name(most_common[0][0])
#     secondary_color = rgb_to_color_name(most_common[1][0]) if len(most_common) > 1 else None

#     return primary_color, secondary_color


# def rgb_to_color_name(rgb: tuple) -> str:
#     """
#     Converts an RGB tuple to a human-readable color name.
#     """
#     try:
#         # Try to find the exact color name
#         return rgb_to_name(rgb)
#     except ValueError:
#         # If the exact color name is not found, find the closest match
#         closest_color = min(
#             CSS3_NAMES_TO_HEX.keys(),
#             key=lambda name: _color_distance(rgb, _hex_to_rgb(CSS3_NAMES_TO_HEX[name]))
#         )
#         return closest_color

# def _hex_to_rgb(hex_color: str) -> tuple:
#     """
#     Converts a HEX color string to an RGB tuple.
#     """
#     hex_color = hex_color.lstrip("#")
#     return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

# def _color_distance(rgb1: tuple, rgb2: tuple) -> int:
#     """
#     Calculates the Euclidean distance between two RGB colors.
#     """
#     return sum((c1 - c2) ** 2 for c1, c2 in zip(rgb1, rgb2))


# def detect_clothing_type(cropped_image: Image.Image) -> str:
#     """
#     Determines the type of clothing (e.g., shirt, pants, socks) from the cropped image.
#     """
#     # Placeholder logic: Use the category_name from the model or additional heuristics
#     # For now, we assume the model's category_name is accurate
#     # You can replace this with a more advanced model for clothing type classification
#     width, height = cropped_image.size

#     # Example heuristic: Use aspect ratio to guess clothing type
#     aspect_ratio = height / width
#     if aspect_ratio > 1.5:
#         return "pants"
#     elif aspect_ratio < 0.8:
#         return "socks"
#     else:
#         return "shirt"
