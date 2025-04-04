document.addEventListener('DOMContentLoaded', async () => {
    const qrResult = document.getElementById('qr-result');
    
    // 1. Verificar si el navegador soporta la API de cámara
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        qrResult.innerHTML = `
            <p style="color: red;">Tu navegador no soporta acceso a cámara</p>
            <p>Por favor usa Chrome o Firefox en Android</p>
        `;
        return;
    }

    // 2. Configuración optimizada para móviles
    const html5QrCode = new Html5Qrcode("qr-reader");
    const config = { 
        fps: 15,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        facingMode: "environment"
    };

    // 3. Función para iniciar el escáner
    async function startScanner() {
        try {
            // Obtener lista de cámaras disponibles
            const cameras = await Html5Qrcode.getCameras();
            if (cameras.length === 0) {
                throw new Error("No se encontraron cámaras");
            }

            // Iniciar con la cámara trasera (environment)
            await html5QrCode.start(
                { facingMode: "environment" },
                config,
                qrCodeSuccessCallback,
                qrCodeErrorCallback
            );
            
        } catch (error) {
            handleCameraError(error);
        }
    }

    // 4. Callback para códigos escaneados
    function qrCodeSuccessCallback(decodedText) {
        html5QrCode.pause();
        validateTicket(decodedText);
    }

    // 5. Callback para errores
    function qrCodeErrorCallback(error) {
        console.warn("Error al escanear:", error);
    }

    // 6. Validar el boleto con el servidor
    async function validateTicket(ticketId) {
        try {
            qrResult.innerHTML = `<p>Validando boleto: ${ticketId}</p>`;
            
            const response = await fetch('/api/validar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigo: ticketId })
            });
            
            const data = await response.json();
            showResult(data.valido, data.mensaje, ticketId);
            
        } catch (error) {
            qrResult.innerHTML = `<p style="color: red;">Error de conexión</p>`;
        } finally {
            // Reanudar después de 3 segundos
            setTimeout(() => {
                qrResult.innerHTML = '';
                html5QrCode.resume();
            }, 3000);
        }
    }

    // 7. Mostrar resultados
    function showResult(isValid, message, ticketId) {
        qrResult.innerHTML = `
            <div style="background: ${isValid ? '#2ecc71' : '#e74c3c'}; 
                       color: white; 
                       padding: 15px; 
                       border-radius: 5px;">
                <h2>${isValid ? '✓ VÁLIDO' : '✖ INVÁLIDO'}</h2>
                <p>${ticketId}</p>
                <p>${message}</p>
            </div>
        `;
    }

    // 8. Manejo de errores
    function handleCameraError(error) {
        console.error("Error de cámara:", error);
        qrResult.innerHTML = `
            <div style="color: red; margin: 20px;">
                <p>No se pudo acceder a la cámara:</p>
                <p><strong>${error.message}</strong></p>
                <p>Solución:</p>
                <ol>
                    <li>Asegúrate de usar HTTPS</li>
                    <li>Haz click en el ícono de candado y da permisos de cámara</li>
                    <li>Prueba en Chrome o Firefox</li>
                </ol>
                <button onclick="window.location.reload()">Reintentar</button>
            </div>
        `;
    }

    // Iniciar el escáner
    startScanner();
});