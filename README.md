# Piedra de Agua - Website Redesign & GoHighLevel Clone

Un rediseño de ultra-lujo 2026 y clonación del sitio web oficial de **Piedra de Agua Fuente Termal & Spa** (Cuenca, Ecuador). Este proyecto está optimizado y preparado específicamente para ser desplegado en **GoHighLevel (GHL)** mediante elementos HTML personalizados totalmente autónomos y autocontenidos.

---

## 🌟 Características Clave

- **Diseño Glassmorphic "Liquid Glass" (2026)**: Estética premium de cristal esmerilado con reflejos dorados y transiciones suaves, elevando la identidad de la marca.
- **Doble Tema (Modo Oscuro & Modo Claro)**: Alternancia fluida entre el tema *Obsidiana Volcánica* (Oscuro, por defecto) y *Arcilla Mineral* (Claro, arena suave) mediante un botón en la barra superior.
- **Fondo Interactivo WebGPU (con fallback a WebGL y CSS)**: Un lienzo fluido que emula el movimiento y las ondas del agua de las fuentes termales volcánicas, acelerado por hardware de última generación, y con optimización automática mediante `IntersectionObserver` para ahorrar batería cuando la página no está visible.
- **Micro-Interacciones & Cursor Dinámico**: Seguidor de cursor dorado adaptativo que reacciona a los elementos interactivos con textos contextuales ("Ver Detalle", "Reservar", etc.).
- **Carrito de Reservas & Checkout de WhatsApp**: Carrito e-commerce interactivo lateral (Cart Drawer) que compila los pases, masajes y membresías seleccionados por el cliente, enviando un mensaje pre-estructurado y formateado directamente al canal oficial de reservas (+593-99-941-7574).
- **Formulario de Reserva Nativo (GHL-Ready)**: Formulario de contactos y reserva integrado con validación interactiva y fallback de comunicación inmediata.
- **Mapa Customizado**: Mapa de ubicación de Google Maps con filtro de inversión en modo oscuro para integrarse al diseño nocturno del spa, volviendo a su color natural en modo claro.

---

## 📂 Estructura del Proyecto

```bash
├── index.html                   # Página de inicio: circuitos, beneficios, adelantos
├── sobre-nosotros.html          # Nosotros: historia, timeline interactiva de premios
├── circuito-de-spa.html         # Circuito termal volcánico de lodoterapia (lodo rojo, azul, cenizo)
├── roca-dorada.html             # Roca Dorada: spa subterráneo y ritual Hammam
├── tour-termal-subterraneo.html # Cueva de velas, exfoliación de café andino
├── terapias-especiales.html     # Flotarium, hidroterapia de flores, hierbas, vino, hielo
├── masajes-de-relajacion.html   # Menú completo de masajes de la caverna termal
├── piscina-termal.html          # Piscinas termales exteriores y áreas familiares
├── libelula-restaurante.html    # Libélula: mixología, gastronomía y menú digital dinámico
├── tienda.html                  # Tienda de spa completa con filtros, buscador y carrito e-commerce
├── contactos.html               # Formulario de reserva, horarios de atención, teléfonos y mapa custom
├── template.html                # Esqueleto base de diseño y layout
├── index.css                    # Sistema de diseño central: variables, tipografía y utilidades
├── main.js                      # Controlador interactivo global, render WebGPU/WebGL y cursor
├── build.py                     # Script compilador en Python (inlines CSS/JS para GoHighLevel)
└── dist/                        # HTML finales compilados listos para pegar en GHL (Autocontenidos)
```

---

## 🚀 Compilación y Despliegue en GoHighLevel

### 1. Compilación Local
Para mantener el código ordenado, modular y escalable, el CSS y JS se desarrollan en archivos separados (`index.css` y `main.js`). El script de compilación inyecta todo el código necesario dentro de cada archivo HTML para que funcione como un solo bloque autocontenido.

Para compilar, ejecute en su terminal:
```bash
python3 build.py
```
Esto creará o actualizará la carpeta `/dist/` con las versiones terminadas listas para usar.

### 2. Despliegue en GoHighLevel (GHL)
1. **Copiar el Código**: Abra cualquiera de las páginas dentro de la carpeta `/dist/` (por ejemplo, `dist/index.html`) y copie todo su contenido.
2. **Pegar en GHL**: En su constructor de páginas de GoHighLevel, añada un elemento **Custom HTML / JS**. Haga doble clic y pegue el código copiado.
3. **Carga de Imágenes**:
   - Suba las carpetas de imágenes (`Sobre Nosotros...` y `Tienda Online...`) a su CDN o biblioteca multimedia de GoHighLevel.
   - En el código de GoHighLevel, reemplace las rutas relativas (`./Tienda Online...`) por las URLs absolutas provistas por la biblioteca de medios de GHL para asegurar la visualización correcta de los logos y portadas.

---

## 🛠️ Tecnologías y Librerías Utilizadas

- **HTML5 & CSS3 Vanilla**: Flexbox, Grid, CSS Variables y variables de estado para el tema dinámico.
- **JavaScript (ES6+)**: Interactividad nativa, manipulación de DOM y control de almacenamiento local (`localStorage`).
- **WebGPU / WebGL**: Renderización en tiempo real del shader de fluidos de agua termal.
- **GSAP (GreenSock Animation Platform)**: Animaciones de desplazamiento suaves y revelaciones dinámicas en tarjetas y paneles.
- **Phosphor Icons**: Librería tipográfica de iconos de alta definición y trazo premium.
- **Google Fonts**: Fuentes tipográficas de lujo (`Cormorant Garamond` para títulos editoriales y `Outfit` para descripciones legibles).

---

## 📅 Horario de Atención de Piedra de Agua
- **Lunes a Sábado**: 07:00 – 22:00
- **Domingos**: 07:00 – 21:00
- *Atendemos los 365 días del año (incluido feriados).*
- **Reservas Directas**: +593-99-941-7574
