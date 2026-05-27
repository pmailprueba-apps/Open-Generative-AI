from PIL import Image
import os

images = [
    'public/assets/imagenes/DETALLES/precision_horquillas.png',
    'public/assets/imagenes/SERVICIOS/plataforma_elevacion_1779381531577.png',
    'public/assets/imagenes/SERVICIOS/pisos_epoxicos_1779381544243.png',
    'public/assets/imagenes/SERVICIOS/maniobras_logistica_1779381559594.png'
]

# Open images
imgs = [Image.open(img) for img in images]

# Find the target size (use the first image's size or a standard like 1920x1080 divided by 2)
target_width = 1920 // 2
target_height = 1080 // 2

# Resize and crop all images to target size
def resize_and_crop(img, size):
    img_ratio = img.width / img.height
    target_ratio = size[0] / size[1]
    if img_ratio > target_ratio:
        new_width = int(img.height * target_ratio)
        offset = (img.width - new_width) // 2
        img = img.crop((offset, 0, offset + new_width, img.height))
    else:
        new_height = int(img.width / target_ratio)
        offset = (img.height - new_height) // 2
        img = img.crop((0, offset, img.width, offset + new_height))
    return img.resize(size, Image.Resampling.LANCZOS)

resized_imgs = [resize_and_crop(img, (target_width, target_height)) for img in imgs]

# Create a new blank image for the collage (1920x1080)
collage = Image.new('RGB', (1920, 1080))

# Paste images into the collage
collage.paste(resized_imgs[0], (0, 0))
collage.paste(resized_imgs[1], (target_width, 0))
collage.paste(resized_imgs[2], (0, target_height))
collage.paste(resized_imgs[3], (target_width, target_height))

# Save the collage
output_path = 'public/assets/imagenes/PORTADA/hero_collage.jpg'
collage.save(output_path, 'JPEG', quality=85)
print(f"Collage saved to {output_path}")
