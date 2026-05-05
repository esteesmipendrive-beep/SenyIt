document.addEventListener("DOMContentLoaded", () => {
    // Referencias al DOM - Editor
    const estimuloTexto = document.getElementById("estimulo-texto");
    const tituloCaso = document.getElementById("titulo-caso");
    const restriccionTexto = document.getElementById("restriccion-texto");
    const categoriaTag = document.getElementById("categoria-tag");
    const editor = document.getElementById("editor");
    const contadorPalabras = document.getElementById("contador-palabras");
    const btnGuardar = document.getElementById("btn-guardar");

    // Referencias al DOM - Archivo
    const modalArchivo = document.getElementById("modal-archivo");
    const btnAbrirArchivo = document.getElementById("btn-abrir-archivo");
    const btnCerrarArchivo = document.getElementById("btn-cerrar-archivo");
    const listaReflexiones = document.getElementById("lista-reflexiones");

    let casoActual = null;

    // 1. Conexión con la base de datos (JSON)
    fetch('data/casos.json')
        .then(response => {
            if (!response.ok) throw new Error("Fallo en la lectura del JSON.");
            return response.json();
        })
        .then(data => {
            // Seleccionamos un caso aleatorio (por ahora siempre el primero si solo hay uno)
            const indiceAleatorio = Math.floor(Math.random() * data.length);
            casoActual = data[indiceAleatorio]; 
            renderizarCaso(casoActual);
        })
        .catch(error => {
            console.error("Error lógico detectado:", error);
            tituloCaso.innerText = "Error Crítico de Datos";
            estimuloTexto.innerText = "La aplicación no encuentra el archivo /data/casos.json.";
        });

    // 2. Inyección de datos en la interfaz
    function renderizarCaso(caso) {
        categoriaTag.innerText = caso.categoria;
        tituloCaso.innerText = caso.titulo;
        estimuloTexto.innerText = caso.estimulo;
        restriccionTexto.innerText = caso.restriccion;
        actualizarContador(0); 
    }

    // 3. Auditoría en tiempo real de la escritura
    editor.addEventListener("input", () => {
        if (!casoActual) return;
        const texto = editor.value.trim();
        const palabras = texto === "" ? 0 : texto.split(/\s+/).length; 
        actualizarContador(palabras);
    });

    function actualizarContador(palabras) {
        contadorPalabras.innerText = `${palabras} / ${casoActual.condicion_minima_palabras} palabras exigidas`;
        if (palabras >= casoActual.condicion_minima_palabras) {
            btnGuardar.disabled = false;
            btnGuardar.innerText = "Forjar Pensamiento";
            btnGuardar.style.background = "#b30000";
        } else {
            btnGuardar.disabled = true;
            btnGuardar.innerText = "Reflexión Insuficiente";
            btnGuardar.style.background = "#e0e0e0";
        }
    }

    // 4. Mecanismo de Guardado Mejorado (Incluye Título y Categoría)
    btnGuardar.addEventListener("click", () => {
        const reflexion = {
            id_caso: casoActual.id,
            titulo_caso: casoActual.titulo, // Guardamos el contexto para el archivo
            categoria: casoActual.categoria,
            fecha: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' }),
            texto: editor.value.trim()
        };
        
        const historial = JSON.parse(localStorage.getItem('hacha_historial')) || [];
        historial.unshift(reflexion); // Inyectamos al inicio del array (más nuevo primero)
        localStorage.setItem('hacha_historial', JSON.stringify(historial));
        
        editor.value = "";
        actualizarContador(0);
        
        // Forzamos abrir el archivo para mostrar la recompensa psicológica de haber guardado
        abrirArchivo();
    });

    // 5. Lógica del Archivo Histórico
    function abrirArchivo() {
        modalArchivo.classList.remove("oculto");
        renderizarHistorial();
    }

    function cerrarArchivo() {
        modalArchivo.classList.add("oculto");
    }

    function renderizarHistorial() {
        listaReflexiones.innerHTML = ""; // Limpiar lista
        const historial = JSON.parse(localStorage.getItem('hacha_historial')) || [];

        if (historial.length === 0) {
            listaReflexiones.innerHTML = "<p style='color: #666; text-align: center; margin-top: 2rem;'>Tu archivo está vacío. Comienza a forjar tu pensamiento.</p>";
            return;
        }

        historial.forEach(item => {
            const tarjeta = document.createElement("div");
            tarjeta.className = "tarjeta-reflexion";
            
            // Retrocompatibilidad por si los guardados antiguos no tienen título
            const tituloMostrar = item.titulo_caso || `Caso #${item.id_caso}`;
            const categoriaMostrar = item.categoria || "Reflexión";

            tarjeta.innerHTML = `
                <div class="tarjeta-meta">
                    <span><strong>${categoriaMostrar}</strong>: ${tituloMostrar}</span>
                    <span>${item.fecha}</span>
                </div>
                <div class="tarjeta-texto">${item.texto}</div>
            `;
            listaReflexiones.appendChild(tarjeta);
        });
    }

    // Eventos de los botones del archivo
    btnAbrirArchivo.addEventListener("click", abrirArchivo);
    btnCerrarArchivo.addEventListener("click", cerrarArchivo);
});
