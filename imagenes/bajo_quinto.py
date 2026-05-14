import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch
import numpy as np

fig, ax = plt.subplots(1, 1, figsize=(16, 12))
ax.set_xlim(0, 20)
ax.set_ylim(0, 14)
ax.set_aspect('equal')
ax.axis('off')

# Fondo
fig.patch.set_facecolor('#1a1a2e')
ax.set_facecolor('#1a1a2e')

# Título
ax.text(10, 13.2, 'BAJO QUINTO - DIAGRAMA DE NOTAS', 
        ha='center', va='center', fontsize=18, fontweight='bold', 
        color='#f0e68c', fontfamily='sans-serif')

ax.text(10, 12.5, '5 Cuerdas | Tonos: E - A - D - G - C (de abajo hacia arriba)', 
        ha='center', va='center', fontsize=11, color='#cccccc', fontfamily='sans-serif')

# Definición de notas por cuerda (una octava, simplificado)
# Cuerdas: C (5ta), G (4ta), D (3ra), A (2da), E (1ra) - de abajo hacia arriba visualmente
cuerdas = ['E', 'A', 'D', 'G', 'C']  # de abajo hacia arriba
notas_cromatico = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

# Posición de las cuerdas en Y (de abajo hacia arriba)
pos_y = [2, 3.5, 5, 6.5, 8]
ancho_cuerda = 0.4

# Dibujar las cuerdas
for i, (y, nombre) in enumerate(zip(pos_y, cuerdas)):
    ax.plot([1.5, 18.5], [y, y], color='#c0c0c0', linewidth=2.5 - i*0.2)
    ax.text(1, y, nombre, ha='center', va='center', fontsize=14, fontweight='bold', 
            color='#f0e68c')

# Dibujar trastes (frentes)
trastes_x = [3, 5, 7, 9, 11, 13, 15, 17]
for x in traste_x:
    ax.plot([x, x], [1.5, 8.5], color='#8b7355', linewidth=2)
# Travesaño superior
ax.plot([1.5, 18.5], [8.5, 8.5], color='#8b7355', linewidth=4)

# Números de traste
for i, x in enumerate(trastes_x, 1):
    ax.text(x, 9.2, str(i), ha='center', va='center', fontsize=10, color='#aaaaaa')

# Notas fundamentales en cada cuerda (sin食指)
notas_fundamentales = {
    'C': ('C', 2, 3),   # C en traste 3 de cuerda C
    'G': ('G', 5, 2),   # G en traste 5 de cuerda G  
    'D': ('D', 5, 1),   # D en traste 5 de cuerda D
    'A': ('A', 5, 0),   # A en traste 5 de cuerda A
    'E': ('E', 5, 0),   # E en traste 5 de cuerda E
}

# Posición de dedos (fingerings para notas básicas)
# Formato: (cuerda, traste, dedo, nota)
fingerings = [
    # C en cuerda C (5ta)
    (4, 3, 3, 'C'),
    # D en cuerda D (3ra)
    (2, 5, 1, 'D'),
    # E en cuerda E (1ra)
    (0, 5, 1, 'E'),
    # F en cuerda E (1ra)
    (0, 6, 2, 'F'),
    # G en cuerda G (4ta)
    (3, 5, 3, 'G'),
    # A en cuerda A (2da)
    (1, 5, 1, 'A'),
    # B en cuerda A (2da)
    (1, 7, 4, 'B'),
    # C en cuerda A (2da)
    (1, 8, 2, 'C'),
    # D en cuerda A (2da)
    (1, 10, 4, 'D'),
    # E en cuerda A (2da)
    (1, 12, 2, 'E'),
    # F en cuerda D (3ra)
    (2, 6, 1, 'F'),
    # G en cuerda D (3ra)
    (2, 8, 3, 'G'),
    # A en cuerda D (3ra)
    (2, 10, 1, 'A'),
    # B en cuerda D (3ra)
    (2, 12, 2, 'B'),
    # C en cuerda D (3ra)
    (2, 13, 4, 'C'),
    # D en cuerda G (4ta)
    (3, 7, 1, 'D'),
    # E en cuerda G (4ta)
    (3, 9, 2, 'E'),
    # F en cuerda G (4ta)
    (3, 10, 4, 'F'),
    # G en cuerda G (4ta)
    (3, 12, 2, 'G'),
    # A en cuerda G (4ta)
    (3, 14, 1, 'A'),
    # B en cuerda G (4ta)
    (3, 16, 2, 'B'),
    # C en cuerda G (4ta)
    (3, 17, 4, 'C'),
]

# Colores por dedo
colores_dedo = {
    0: '#ff6b6b',  # índice - rojo
    1: '#4ecdc4',  # medio - turquesa
    2: '#ffe66d',  # anular - amarillo
    3: '#95e1d3',  # meñique - verde claro
    4: '#dda0dd',  # pulgar - morado
}

nombres_dedo = {0: 'ÍNDICE', 1: 'MEDIO', 2: 'ANULAR', 3: 'MEÑIQUE', 4: 'PULGAR'}

# Dibujar las posiciones de dedos
for idx, (cuerda_idx, traste, dedo, nota) in enumerate(fingerings):
    x = traste_x[traste - 1] if traste <= len(trastes_x) else traste_x[-1] + (traste - len(trastes_x)) * 2
    y = pos_y[cuerda_idx]
    
    # Determinar posición X del círculo
    if traste <= len(trastes_x):
        x = traste_x[traste - 1]
    else:
        x = traste_x[-1] + (traste - len(trastes_x)) * 2
    
    circle = plt.Circle((x, y), 0.35, color=colores_dedo[dedo], ec='white', linewidth=2, zorder=5)
    ax.add_patch(circle)
    ax.text(x, y, nota, ha='center', va='center', fontsize=11, fontweight='bold', 
            color='#1a1a2e', zorder=6)
    
    # Etiqueta del dedo
    ax.text(x + 0.5, y + 0.45, str(dedo + 1), ha='left', va='bottom', fontsize=8, 
            color=colores_dedo[dedo], fontweight='bold')

# Leyenda de dedos
legend_y = 10.5
ax.text(10, legend_y + 0.8, 'POSICIONES DE DEDOS', ha='center', fontsize=12, 
        fontweight='bold', color='#f0e68c')

for i, (dedo, color) in enumerate(colores_dedo.items()):
    x_pos = 4 + i * 2.8
    circle = plt.Circle((x_pos, legend_y), 0.25, color=color, ec='white', linewidth=1.5)
    ax.add_patch(circle)
    ax.text(x_pos, legend_y - 0.6, f'{i+1} - {nombres_dedo[dedo]}', ha='center', 
            va='top', fontsize=8, color='#cccccc')

# Diagrama de digitación manual (para referencia)
ax.text(10, 1.0, 'DIAGRAMA DE DEDOS: ① ÍNDICE  ② MEDIO  ③ ANULAR  ④ MEÑIQUE  ⑤ PULGAR', 
        ha='center', va='center', fontsize=9, color='#888888', style='italic')

# Notas en círculo (explicación)
ax.text(17, 11.8, '● = Nota natural', ha='left', fontsize=9, color='#ffffff')
ax.text(17, 11.3, 'Color = Dedo usado', ha='left', fontsize=9, color='#cccccc')

plt.tight_layout()
plt.savefig('bajo_quinto_diagrama.png', dpi=150, facecolor='#1a1a2e', 
            bbox_inches='tight', pad_inches=0.3)
plt.close()
print("Diagrama guardado: bajo_quinto_diagrama.png")
