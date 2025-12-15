import os
from PIL import Image

TARGET_SIZE = (181, 114)
JPEG_QUALITY = 90

def convert_png_to_jpg(root_dir):
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            filename_lower = file.lower()

            # ❌ SKIP file yang mengandung "old"
            if "old" in filename_lower:
                continue

            # ✅ PROSES HANYA file yang mengandung "thumb" dan berakhiran .png
            if "thumb" in filename_lower and filename_lower.endswith(".png"):
                png_path = os.path.join(root, file)
                base_name = os.path.splitext(file)[0]

                old_png_path = os.path.join(root, f"{base_name}(old).png")
                jpg_path = os.path.join(root, f"{base_name}.jpg")

                try:
                    # Rename file asli → (old)
                    os.rename(png_path, old_png_path)

                    # Konversi ke JPG
                    with Image.open(old_png_path) as img:
                        img = img.convert("RGB")
                        img = img.resize(TARGET_SIZE, Image.LANCZOS)
                        img.save(
                            jpg_path,
                            "JPEG",
                            quality=JPEG_QUALITY,
                            optimize=True
                        )

                    print(f"✔ {png_path} → {jpg_path}")

                except Exception as e:
                    print(f"✖ Error {png_path}: {e}")

if __name__ == "__main__":
    ROOT_DIRECTORY = "."
    convert_png_to_jpg(ROOT_DIRECTORY)
