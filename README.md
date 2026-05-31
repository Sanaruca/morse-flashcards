# Morse Flashcards — Aprendizaje Interactivo de Código Morse

Aplicación web educativa tipo "flashcard" para aprender código Morse de forma progresiva. Proyecto de evaluación para la unidad curricular.

---

## Fase 1 — Planeación

- **Tema educativo:** Código Morse internacional.
- **Público objetivo:** Adolescentes y adultos.
- **Objetivos de aprendizaje:**
  - Memorizar las secuencias de puntos y rayas de cada letra (A–Z).
  - Aprender los dígitos del 0 al 9.
  - Asociar cada carácter con su representación Morse mediante práctica repetitiva.
  - Avanzar desde lo simple (E, T) hasta lo complejo (dígitos) en niveles.

---

## Fase 2 — Diseño

- **Esquema de navegación:** Pantalla única con flujo guiado por niveles. El usuario ve una tarjeta con un carácter y pulsa un botón para responder.
- **Colores:** Fondo oscuro (#1a1a2e → #16213e), verde para aciertos, rojo para errores. El botón central simula una tecla de telégrafo.
- **Tipografía:** Fuentes nativas del sistema (`-apple-system`, `Segoe UI`, `Roboto`).
- **Interfaz:** Tarjeta con volteo 3D, barra de progreso y retroalimentación visual inmediata.

---

## Fase 3 — Desarrollo

### Tecnologías

| Tecnología | Propósito |
|-----------|-----------|
| **HTML5** | Estructura de la página |
| **CSS3** | Estilo visual, animaciones, diseño responsivo |
| **JavaScript (ES6+)** | Lógica del juego, eventos, Web Audio API |
| **Web Audio API** | Sonidos de tonos Morse, acierto y error |

### Herramientas

- Editor: **Visual Studio Code**
- Control de versiones: **Git**
- Sin librerías externas ni frameworks.

### Recursos multimedia

- **Audio:** Generado con la Web Audio API (osciladores). No usa archivos de audio.
- **Visuales:** Elementos gráficos creados con CSS. Sin imágenes externas.

---

## Fase 4 — Evaluación

- Probado en Chrome, Firefox, Edge, Android y iOS.
- Soporta teclado (espacio, F) y pantalla táctil.
- Diseño responsivo para móviles y escritorio.
- Validación automática con retroalimentación visual y sonora.

---

## Fase 5 — Presentación

**Propósito educativo:** Convertir el aprendizaje del código Morse en una práctica interactiva mediante tarjetas flash y un pulsador simulado. La repetición espaciada y los niveles progresivos ayudan a interiorizar las secuencias de forma natural.

---

## Contenidos implementados

| Sección | Descripción |
|--------|------------|
| Inicio / Bienvenida | Instrucciones y primer nivel cargado |
| Contenido educativo | 6 niveles con A–Z y 0–9 |
| Actividades interactivas | Tarjetas flash con pulsador Morse y validación automática |
| Retroalimentación | Visual (color, animación) y sonora |
| Barra de progreso | Seguimiento del avance por nivel |

### Extras incluidos

- Animaciones CSS (3D flip, shake, símbolos animados)
- Diseño responsivo para móviles
- Síntesis de audio (sin archivos externos)

---

## Cómo ejecutar

Abrir `index.html` en cualquier navegador. No requiere servidor.

```bash
git clone <url-del-repositorio>
open index.html   # macOS
xdg-open index.html  # Linux
start index.html  # Windows
```
