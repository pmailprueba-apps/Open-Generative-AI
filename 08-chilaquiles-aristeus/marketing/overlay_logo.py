from PIL import Image, ImageDraw, ImageFilter
import os

def overlay_logo():
    # Paths
    base_dir = "/Users/macbook/Proyectos/08-chilaquiles-aristeus"
    bg_path = os.path.join(base_dir, "marketing/anuncio-3-desayuno-campeon.png")
    logo_path = os.path.join(base_dir, "assets/logo sin fondo .png")
    output_path = os.path.join(base_dir, "marketing/flyer_invitacion_desayuno.png")

    print(f"Loading background: {bg_path}")
    bg = Image.open(bg_path).convert("RGBA")
    
    print(f"Loading logo: {logo_path}")
    logo = Image.open(logo_path).convert("RGBA")

    # Resize logo
    # Target size of logo: 220px width, maintaining aspect ratio
    aspect_ratio = logo.height / logo.width
    new_width = 220
    new_height = int(new_width * aspect_ratio)
    logo_resized = logo.resize((new_width, new_height), Image.Resampling.LANCZOS)

    # We will create a premium white card (rounded rectangle) to place the logo on,
    # so it stands out perfectly from the background table/napkin.
    padding = 20
    card_width = new_width + (padding * 2)
    card_height = new_height + (padding * 2)
    
    card = Image.new("RGBA", (card_width, card_height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(card)
    
    # Draw rounded rectangle for the card
    # Let's make it clean white with 240/255 opacity for a subtle premium look
    draw.rounded_rectangle(
        [(0, 0), (card_width, card_height)],
        radius=15,
        fill=(255, 255, 255, 245),
        outline=(218, 165, 32, 120), # Subtle gold border
        width=2
    )

    # Paste the logo into the card
    card.paste(logo_resized, (padding, padding), logo_resized)

    # Paste the card onto the background
    # Let's put it in the top-left corner, with a 30px margin
    margin = 35
    position = (margin, margin)
    
    bg.paste(card, position, card)
    
    # Save the final image as RGB (JPEG/PNG)
    final_img = bg.convert("RGB")
    final_img.save(output_path, "PNG")
    print(f"✓ Saved final flyer to: {output_path}")

if __name__ == "__main__":
    overlay_logo()
