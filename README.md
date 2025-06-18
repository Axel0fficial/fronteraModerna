# Frontera Moderna

Es un repositorio que utiliza Node.JS y MySQL
Funciona con Node.JS v22.11.0.

Empecemos con Node.JS

1.Copia o descarga los archivos
- Usa "git clone https://github.com/Axel0fficial/fronteraModerna.git"

2.En tu carpeta de proyecto escribe "npm install"
3.Populate ".env" from ".env.example"
.env psoiblemente no existe en tu carpeta de proyecto 
Crealo en la terminal ingresando "copy .env.example .env"

MySQL Setup

1. Asegurate de que MySQL este corriendo:
   - Abre MySQL Workbench
   - En el panel Home deberias ver una coneccion a el predeterminado "Local instance MySQL80"
   - Haz click en ▶️ “Start Server” si no esta corriendo.

2. Crea un nuevo "schema":
   - En la barra de herramientas ve a Schema y selecciona "Create new schema"
   - Nombralo exacatamente como estara en .env DB_NAME
   - Selecciona Apply un par de veces y correlo denuevo
  
3. Crea un usuario:
   - Anda a Server -> User and Privileges
   - Add Account, crea un usuario y dale una contraseña
   - en Schema Privileges, haz click en Add Entry elige tu schema y grant All privileges
   - Haz click en Appply

4. Edita el .env para que este actualizado con tu base de dato


Para empezar el servicio escribe "node server.js" en la terminal

Notar que tu base de datos estara vacia voy a crear algo para eso 


Use Postman to hit:

    POST /api/auth/register
    POST /api/auth/login
    POST /api/forms/upload (with pdf file)
    GET /api/forms
    PATCH /api/forms/:id/status
    POST /api/support
    GET /api/support
