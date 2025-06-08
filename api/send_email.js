import { Resend } from 'resend';
// api/send-email.js

// La clave de API de Resend NO debe estar aquí directamente.
// Vercel la inyectará a través de una variable de entorno.
const resend = new Resend(process.env.RESEND_API_KEY);

// Esta es la estructura que Vercel espera para sus funciones serverless
module.exports = async (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Manejo de la solicitud "preflight" (OPTIONS)
    if (req.method === 'OPTIONS') {
        res.status(200).end(); // Responder con éxito a la preflight y terminar
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).setHeader('Allow', 'POST').json({ message: 'Método no permitido' });
        return;
    }

    let data;
    try {
        data = req.body;
    } catch (error) {
        console.error('Error parsing JSON:', error);
        res.status(400).json({ message: 'JSON de solicitud inválido.' });
        return;
    }

    // --- ¡CAMBIOS AQUÍ! Extraer los datos con los nombres de tu formulario React ---
    const { nombre, apellidos, asunto, email, empresa, mensaje } = data;

    // Validación básica (ajustada a los nuevos nombres)
    if (!nombre || !apellidos || !asunto || !email || !mensaje) { // 'empresa' es opcional
        res.status(400).json({ message: 'Por favor, completa los campos requeridos (Nombre, Apellidos, Asunto, email, Mensaje).' });
        return;
    }

    try {
        const emailResponse = await resend.emails.send({
            from: 'Tu Portafolio <portafolioBLAB@resend.dev>',
            to: 'brandonleonardobarrera@gmail.com',
            subject: `Mensaje de Contacto - ${asunto} de ${nombre} ${apellidos}`, // Asunto más detallado
            html: `
                <p>Has recibido un nuevo mensaje desde el formulario de contacto de tu portafolio:</p>
                <p><strong>Nombre Completo:</strong> ${nombre} ${apellidos}</p>
                <p><strong>Correo Electrónico:</strong> ${email}</p>
                <p><strong>Asunto:</strong> ${asunto}</p>
                ${empresa ? `<p><strong>Empresa:</strong> ${empresa}</p>` : ''} {/* Condicional para empresa */}
                <p><strong>Mensaje:</strong></p>
                <p>${mensaje}</p>
                <br>
                <p>---</p>
                <p>Este correo fue enviado desde tu formulario de contacto.</p>
            `,
        });

        console.log('Email enviado con éxito:', emailResponse);
        res.status(200).json({ message: 'Mensaje enviado con éxito', id: emailResponse.id });

    } catch (error) {
        console.error('Error al enviar el email con Resend:', error);
        res.status(500).json({ message: 'Error al enviar el mensaje. Por favor, inténtalo de nuevo más tarde.', error: error.message });
    }
};