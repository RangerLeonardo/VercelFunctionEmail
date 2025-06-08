import { Resend } from 'resend';
// api/send-email.js

// La clave de API de Resend NO debe estar aquí directamente.
// Vercel la inyectará a través de una variable de entorno.
const resend = new Resend(process.env.RESEND_API_KEY);

// Esta es la estructura que Vercel espera para sus funciones serverless
module.exports = async (req, res) => {
    // Solo aceptar solicitudes POST
    if (req.method !== 'POST') {
        res.status(405).setHeader('Allow', 'POST').json({ message: 'Método no permitido' });
        return;
    }

    let data;
    try {
        // Vercel automáticamente parsea el cuerpo de la solicitud JSON si el Content-Type es application/json
        data = req.body;
    } catch (error) {
        console.error('Error parsing JSON:', error);
        res.status(400).json({ message: 'JSON de solicitud inválido.' });
        return;
    }

    const { name, email, message } = data;

    // Validación básica de los datos recibidos
    if (!name || !email || !message) {
        res.status(400).json({ message: 'Por favor, completa todos los campos del formulario.' });
        return;
    }

    try {
        // Envío del correo con Resend
        const emailResponse = await resend.emails.send({
            // ¡IMPORTANTE! Para pruebas, puedes usar 'onboarding@resend.dev'.
            // Para producción, cambia a un dominio que hayas VERIFICADO en Resend (ej. 'contacto@tudominio.com')
            from: 'Tu Nombre <onboarding@resend.dev>',
            to: 'brandonleonardobarrera@gmail.com', // ¡Tu correo personal donde quieres recibir los mensajes!
            subject: `Nuevo mensaje de ${name} desde tu portafolio`,
            html: `
                <p>Has recibido un nuevo mensaje desde tu portafolio:</p>
                <p><strong>Nombre:</strong> ${name}</p>
                <p><strong>Email del remitente:</strong> <span class="math-inline">\{email\}</p\>
                <p><strong>Mensaje:</strong></p>
<p>{message}</p>
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