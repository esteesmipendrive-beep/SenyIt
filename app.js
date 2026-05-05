document.addEventListener("DOMContentLoaded", () => {
    const estimuloTexto = document.getElementById("estimulo-texto");
    const tituloCaso = document.getElementById("titulo-caso");
    const restriccionTexto = document.getElementById("restriccion-texto");
    const categoriaTag = document.getElementById("categoria-tag");
    const editor = document.getElementById("editor");
    const contadorPalabras = document.getElementById("contador-palabras");
    const btnGuardar = document.getElementById("btn-guardar");

    let casoActual = null;

    // 1. Conexión con el archivo JSON
    fetch('data/casos.json')
        .then(response => {
            if (!response.ok) throw new Error("Fallo en la lectura del JSON.");
            return response.json();
        })
        .then(data => {
            casoActual = data[0]; // Por ahora, cargamos el primer caso obligatoriamente
            renderizarCaso(casoActual);
        })
        .catch(error => {
            console.error("Error lógico detectado:", error);
            tituloCaso.innerText = "Error Crítico de Datos";
            estimuloTexto.innerText = "La aplicación no encuentra el archivo /data/casos.json. Verifica la estructura del repositorio.";
        });

    // 2. Inyección de datos en el HTML
    function renderizarCaso(caso) {
        categoriaTag.innerText = caso.categoria;
        tituloCaso.innerText = caso.titulo;
        estimuloTexto.innerText = caso.estimulo;
        restriccionTexto.innerText = caso.restriccion;
        actualizarContador(0); // Inicializar
    }

    // 3. Auditoría en tiempo real de la escritura
    editor.addEventListener("input", () => {
        if (!casoActual) return;
        
        const texto = editor.value.trim();
        // Evita contar un campo vacío como 1 palabra
        const palabras = texto === "" ? 0 : texto.split(/\s+/).length; 
        actualizarContador(palabras);
    });

    function actualizarContador(palabras) {
        contadorPalabras.innerText = `${palabras} / ${casoActual.condicion_minima_palabras} palabras requeridas`;

        if (palabras >= casoActual.condicion_minima_palabras) {
            btnGuardar.disabled = false;
            btnGuardar.innerText = "Forjar Pensamiento";
            btnGuardar.style.background = "#b30000";
            btnGuardar.style.color = "#fff";
        } else {
            btnGuardar.disabled = true;
            btnGuardar.innerText = "Reflexión Insuficiente";
            btnGuardar.style.background = "#e0e0e0";
            btnGuardar.style.color = "#999";
        }
    }

    // 4. Guardado en almacenamiento local y limpieza
    btnGuardar.addEventListener("click", () => {
        const reflexion = {
            id_caso: casoActual.id,
            fecha: new Date().toISOString(),
            texto: editor.value.trim()
        };
        
        const historial = JSON.parse(localStorage.getItem('hacha_historial')) || [];
        historial.push(reflexion);
        localStorage.setItem('hacha_historial', JSON.stringify(historial));
        
        alert("Análisis registrado localmente. Has cumplido la restricción lógica.");
        editor.value = "";
        actualizarContador(0);
    });
});
