from PIL import Image

width_px = 1016
height_px = 638

input_path = "/Users/macbook/.gemini/antigravity-ide/brain/155eb6ae-6939-431a-9ced-205b6f5ebec0/tarjeta_incomparables_v4_1779300224642.png"
output_path = "/Users/macbook/Proyectos/05-incomparables-norteno/marketing/tarjetas/tarjeta_incomparables_final_credit_card_v4.png"

try:
    img = Image.open(input_path)
    # Redimensionar para que la altura encaje perfectamente (sin cortar nada de arriba a abajo)
    img = img.resize((height_px, height_px), Image.Resampling.LANCZOS)
    
    # Crear un nuevo lienzo del tamaño final exacto
    final_img = Image.new("RGB", (width_px, height_px))
    
    # Calcular los márgenes laterales
    side_width = (width_px - height_px) // 2
    
    # Extender el borde izquierdo
    left_edge = img.crop((0, 0, 1, height_px))
    left_fill = left_edge.resize((side_width, height_px))
    final_img.paste(left_fill, (0, 0))
    
    # Pegar la imagen original en el centro
    final_img.paste(img, (side_width, 0))
    
    # Extender el borde derecho
    right_edge = img.crop((height_px - 1, 0, height_px, height_px))
    right_fill = right_edge.resize((width_px - height_px - side_width, height_px))
    final_img.paste(right_fill, (side_width + height_px, 0))
    
    # Guardar
    final_img.save(output_path, dpi=(300, 300))
    print("Éxito. Imagen generada con extensión de bordes.")
except Exception as e:
    print("Error:", e)
