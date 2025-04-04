document.addEventListener('DOMContentLoaded', async () => {
    const qrReader = new Html5Qrcode('qr-reader');
    const validoDiv = document.getElementById('valido');
    const invalidoDiv = document.getElementById('invalido');
    const codigoValido = document.getElementById('codigo-valido');
    const mensajeError = document.getElementById('mensaje-error');

    // Configuración mejorada para móviles
    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        facingMode: "environment" // Siempre usa cámara trasera
    };

    function mostrarResultado(valido, mensaje, codigo) {
        validoDiv.style.display = valido ? 'block' : 'none';
        invalidoDiv.style.display = valido ? 'none' : 'block';
        
        if (valido) {
            codigoValido.textContent = `Boleto: ${codigo}`;
        } else {
            mensajeError.textContent = mensaje;
        }
    }

    try {
        // Intenta obtener una lista de cámaras primero
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
            await qrReader.start(
                cameras[0].id,  // Usa la primera cámara disponible
                config,
                async (codigo) => {
                    qrReader.pause();
                    try {
                        const response = await fetch('/api/validar', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ codigo })
                        });
                        const data = await response.json();
                        mostrarResultado(data.valido, data.mensaje, codigo);
                        
                        setTimeout(() => {
                            validoDiv.style.display = 'none';
                            invalidoDiv.style.display = 'none';
                            qrReader.resume();
                        }, 3000);
                    } catch (error) {
                        mostrarResultado(false, 'Error de conexión');
                        qrReader.resume();
                    }
                },
                (mensajeError) => {
                    console.warn("Advertencia del escáner:", mensajeError);
                }
            );
        } else {
            throw new Error("No se encontraron cámaras");
        }
    } catch (error) {
        console.error("Error al iniciar cámara:", error);
        document.getElementById('qr-reader').innerHTML = `
            <div class="camera-error">
                <p>No se pudo acceder a la cámara:</p>
                <p>${error.message}</p>
                <button onclick="window.location.reload()">Reintentar</button>
            </div>
        `;
        
        // Estilo para el mensaje de error
        const style = document.createElement('style');
        style.textContent = `
            .camera-error {
                padding: 20px;
                text-align: center;
                color: #fff;
                background: #e74c3c;
                border-radius: 5px;
            }
            .camera-error button {
                margin-top: 10px;
                padding: 8px 15px;
                background: #fff;
                color: #e74c3c;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    }
});