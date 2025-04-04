document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const resultDiv = document.getElementById('result');
    
    // Configuración optimizada para códigos QR
    const config = {
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#interactive'),
            constraints: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: "environment" // Cámara trasera
            },
        },
        decoder: {
            readers: ["qrcode_reader"],
            debug: {
                showCanvas: false,
                showPatches: false,
                showFoundPatches: false,
                showSkeleton: false,
                showLabels: false,
                showPatchLabels: false,
                showRemainingPatchLabels: false,
                boxFromPatches: {
                    showTransformed: false,
                    showTransformedBox: false,
                    showBB: false
                }
            }
        },
        locate: true,
        frequency: 5
    };

    // Iniciar el escáner
    startButton.addEventListener('click', () => {
        resultDiv.innerHTML = '<p>Iniciando cámara...</p>';
        
        Quagga.init(config, function(err) {
            if (err) {
                resultDiv.innerHTML = `<p style="color: red;">Error al iniciar cámara: ${err.message}</p>`;
                console.error(err);
                return;
            }
            
            Quagga.start();
            startButton.disabled = true;
            stopButton.disabled = false;
            resultDiv.innerHTML = '<p>Escaneando códigos QR...</p>';
        });

        Quagga.onDetected(function(result) {
            const code = result.codeResult.code;
            Quagga.stop();
            validateTicket(code);
        });
    });

    // Detener el escáner
    stopButton.addEventListener('click', () => {
        Quagga.stop();
        startButton.disabled = false;
        stopButton.disabled = true;
        resultDiv.innerHTML = '<p>Cámara detenida</p>';
    });

    // Validar el boleto con el servidor
    async function validateTicket(ticketId) {
        try {
            resultDiv.innerHTML = `<p>Validando boleto: ${ticketId}</p>`;
            
            const response = await fetch('/api/validar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigo: ticketId })
            });
            
            const data = await response.json();
            showResult(data.valido, data.mensaje, ticketId);
            
        } catch (error) {
            resultDiv.innerHTML = `<p style="color: red;">Error de conexión</p>`;
        } finally {
            // Permitir reinicio después de 3 segundos
            setTimeout(() => {
                startButton.disabled = false;
                stopButton.disabled = true;
            }, 3000);
        }
    }

    // Mostrar resultados
    function showResult(isValid, message, ticketId) {
        resultDiv.innerHTML = `
            <div style="background: ${isValid ? '#2ecc71' : '#e74c3c'}; 
                       color: white; 
                       padding: 15px; 
                       border-radius: 5px;">
                <h2>${isValid ? '✓ BOLETO VÁLIDO' : '✖ BOLETO INVÁLIDO'}</h2>
                <p>${ticketId}</p>
                <p>${message}</p>
                <button onclick="window.location.reload()">Escanear otro</button>
            </div>
        `;
    }
});