document.addEventListener('DOMContentLoaded', () => {
    const qrReader = new Html5Qrcode('qr-reader');
    const validoDiv = document.getElementById('valido');
    const invalidoDiv = document.getElementById('invalido');
    const codigoValido = document.getElementById('codigo-valido');
    const mensajeError = document.getElementById('mensaje-error');

    function mostrarResultado(valido, mensaje, codigo) {
        validoDiv.style.display = valido ? 'block' : 'none';
        invalidoDiv.style.display = valido ? 'none' : 'block';
        
        if (valido) {
            codigoValido.textContent = `Boleto: ${codigo}`;
        } else {
            mensajeError.textContent = mensaje;
        }
    }

    qrReader.start(
        { facingMode: "environment" },
        {
            fps: 10,
            qrbox: 250
        },
        async (codigo) => {
            qrReader.pause();
            
            try {
                const response = await fetch('/api/validar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
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
            console.error(mensajeError);
        }
    ).catch(err => {
        console.error("Error al iniciar escáner:", err);
    });
});