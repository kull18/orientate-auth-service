# Oriéntate+ - Auth Service

Microservicio de autenticación para el ecosistema **Oriéntate+**, implementado bajo los principios de la **Arquitectura Hexagonal estricta** utilizando TypeScript, Express y PostgreSQL.

---

## 1. Estructura del Proyecto (Arquitectura Hexagonal)

La estructura sigue un flujo de dependencias unidireccional y estricto hacia el dominio. Las capas externas conocen a las internas, pero las internas no conocen ningún detalle de infraestructura.

```text
orientate-auth-service/
├── src/
│   ├── domain/                      # Capa de Dominio (Reglas puras, sin librerías externas)
│   │   ├── entities/                # Entidades de negocio autovalidadas (User)
│   │   └── exceptions/              # Excepciones de negocio personalizadas (BusinessException)
│   ├── application/                 # Capa de Aplicación (Lógica de Casos de Uso)
│   │   ├── ports/
│   │   │   ├── inputs/              # Interfaces de entrada (Register, Login, GetProfile)
│   │   │   └── outputs/             # Interfaces de salida (UserRepository, PasswordHasher, TokenService)
│   │   └── use-cases/               # Implementación de los casos de uso
│   ├── infrastructure/              # Capa de Infraestructura (Detalles tecnológicos)
│   │   └── adapters/
│   │       ├── inputs/              # Adaptadores de entrada (Controladores y Rutas Express HTTP)
│   │       └── outputs/             # Adaptadores de salida (Persistencia PostgreSQL)
│   ├── core/                        # Componentes transversales y compartidos (Cross-cutting Concerns)
│   │   ├── config/                  # Contenedor de Inyección de Dependencias (DI) y validación ENV
│   │   ├── database/                # Pool de conexión, scripts de inicialización y semillas SQL
│   │   ├── security/                # Implementaciones concretas de encriptación y JWT
│   │   └── middlewares/             # Interceptores Express (Manejo de errores global y Auth Guard)
│   ├── app.ts                       # Inicialización del Framework HTTP Express
│   └── server.ts                    # Punto de entrada y arranque del servidor HTTP
├── Dockerfile                       # Construcción multi-stage optimizada
└── docker-compose.yml               # Orquestación local de base de datos y microservicio
```

---

## 2. Requisitos Previos

- **Node.js** v20 o superior.
- **Docker y Docker Compose** instalados (si deseas levantar todo el entorno en contenedores).

---

## 3. Instalación y Ejecución Local

### Paso 1: Instalar dependencias
Desde la raíz del proyecto ejecute:
```bash
npm install
```

### Paso 2: Configurar variables de entorno
Copie el archivo de ejemplo y ajuste sus credenciales si fuera necesario:
```bash
cp .env.example .env
```

### Paso 3: Iniciar Base de Datos Local
Si tienes PostgreSQL instalado localmente, puedes correr el script `src/core/database/init.sql` para crear las tablas y sembrar los roles iniciales (`estudiante`, `orientador`, `universidad`, `alumni`). 

Alternativamente, puedes levantar únicamente el contenedor de la base de datos con:
```bash
docker compose up -d db
```

### Paso 4: Levantar el servidor en desarrollo
```bash
npm run dev
```

El servidor estará escuchando en `http://localhost:3000`. Puede validar la salud del servicio ingresando a: `GET http://localhost:3000/health`.

---

## 4. Ejecución Completa con Docker Compose

Para construir y levantar tanto la base de datos como el microservicio de autenticación de manera automática, ejecuta:

```bash
docker compose up -d --build
```

---

## 5. Documentación de Endpoints (API v1)

### 1. Registrar Usuario
Crea una nueva cuenta de usuario asignándole un rol del sistema.

* **URL:** `/api/v1/auth/register`
* **Método:** `POST`
* **Cuerpo de la Petición:**
  ```json
  {
    "email": "estudiante@orientate.com",
    "name": "Juan Pérez",
    "password": "PasswordSegura123",
    "roleName": "estudiante"
  }
  ```
  *(Roles válidos: `estudiante`, `orientador`, `universidad`, `alumni`)*
* **Respuesta Exitosa (201 Created):**
  ```json
  {
    "status": "success",
    "statusCode": 201,
    "data": {
      "user": {
        "id": "e44146a8-27b0-4dbb-b2ab-63e2329bc0b6",
        "email": "estudiante@orientate.com",
        "name": "Juan Pérez",
        "roleName": "estudiante",
        "isActive": true,
        "createdAt": "2026-06-19T01:50:00.000Z",
        "updatedAt": "2026-06-19T01:50:00.000Z"
      }
    }
  }
  ```

---

### 2. Iniciar Sesión (Login)
Autentica al usuario y devuelve el token JWT en las cabeceras de la respuesta (`Authorization: Bearer <TOKEN>` y `x-auth-token: <TOKEN>`).

* **URL:** `/api/v1/auth/login`
* **Método:** `POST`
* **Cuerpo de la Petición:**
  ```json
  {
    "email": "estudiante@orientate.com",
    "password": "PasswordSegura123"
  }
  ```
* **Cabeceras de Respuesta Exitosas:**
  - `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - `x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
* **Respuesta Exitosa (200 OK):**
  ```json
  {
    "status": "success",
    "statusCode": 200,
    "data": {
      "user": {
        "id": "e44146a8-27b0-4dbb-b2ab-63e2329bc0b6",
        "email": "estudiante@orientate.com",
        "name": "Juan Pérez",
        "roleName": "estudiante",
        "isActive": true,
        "createdAt": "2026-06-19T01:50:00.000Z",
        "updatedAt": "2026-06-19T01:50:00.000Z"
      }
    }
  }
  ```

---

### 3. Consultar Perfil del Usuario Autenticado
Obtiene los detalles del perfil actual validando el token Bearer enviado en las cabeceras.

* **URL:** `/api/v1/auth/me`
* **Método:** `GET`
* **Cabeceras Requeridas:**
  `Authorization: Bearer <TOKEN_OBTENIDO_EN_LOGIN>`
* **Respuesta Exitosa (200 OK):**
  ```json
  {
    "status": "success",
    "statusCode": 200,
    "data": {
      "user": {
        "id": "e44146a8-27b0-4dbb-b2ab-63e2329bc0b6",
        "email": "estudiante@orientate.com",
        "name": "Juan Pérez",
        "roleName": "estudiante",
        "isActive": true,
        "createdAt": "2026-06-19T01:50:00.000Z",
        "updatedAt": "2026-06-19T01:50:00.000Z"
      }
    }
  }
  ```

---

### 4. Cerrar Sesión (Logout)
Informa al servidor y limpia las cabeceras (stateless logout). El cliente debe eliminar el token del almacenamiento local.

* **URL:** `/api/v1/auth/logout`
* **Método:** `POST`
* **Cabeceras Requeridas:**
  `Authorization: Bearer <TOKEN>`
* **Respuesta Exitosa (200 OK):**
  ```json
  {
    "status": "success",
    "statusCode": 200,
    "message": "Sesión cerrada correctamente. Por favor, elimine el token de su almacenamiento local."
  }
  ```

---

### 5. Recuperar Contraseña
Solicita la recuperación de contraseña de un usuario mediante su email. Genera un token temporal y lo imprime en la consola del servidor (y se devuelve en la respuesta para facilitar pruebas).

* **URL:** `/api/v1/auth/recover-password`
* **Método:** `POST`
* **Cuerpo de la Petición:**
  ```json
  {
    "email": "estudiante@orientate.com"
  }
  ```
* **Respuesta Exitosa (200 OK):**
  ```json
  {
    "status": "success",
    "statusCode": 200,
    "data": {
      "message": "Instrucciones de recuperación de contraseña generadas con éxito.",
      "token": "d7c82b4a-..."
    }
  }
  ```

---

### 6. Restablecer Contraseña
Restablece la contraseña de un usuario utilizando el token válido recibido y una nueva contraseña.

* **URL:** `/api/v1/auth/reset-password`
* **Método:** `POST`
* **Cuerpo de la Petición:**
  ```json
  {
    "token": "d7c82b4a-...",
    "newPassword": "NuevaPasswordSegura123"
  }
  ```
* **Respuesta Exitosa (200 OK):**
  ```json
  {
    "status": "success",
    "statusCode": 200,
    "message": "Contraseña restablecida con éxito."
  }
  ```

---

### 7. Actualizar Perfil Propio
Permite al usuario autenticado modificar su nombre o dirección de correo electrónico.

* **URL:** `/api/v1/auth/me`
* **Método:** `PATCH`
* **Cabeceras Requeridas:**
  `Authorization: Bearer <TOKEN>`
* **Cuerpo de la Petición:**
  ```json
  {
    "name": "Juan Pérez Modificado",
    "email": "juan.modificado@orientate.com"
  }
  ```
  *(Ambos campos son opcionales)*
* **Respuesta Exitosa (200 OK):**
  ```json
  {
    "status": "success",
    "statusCode": 200,
    "data": {
      "user": {
        "id": "e44146a8-27b0-4dbb-b2ab-63e2329bc0b6",
        "email": "juan.modificado@orientate.com",
        "name": "Juan Pérez Modificado",
        "roleName": "estudiante",
        "isActive": true,
        "createdAt": "2026-06-19T01:50:00.000Z",
        "updatedAt": "2026-06-19T01:52:00.000Z"
      }
    }
  }
  ```

---

### 8. Consultar Roles
Obtiene la lista de todos los roles disponibles en el sistema.

* **URL:** `/api/v1/auth/roles`
* **Método:** `GET`
* **Respuesta Exitosa (200 OK):**
  ```json
  {
    "status": "success",
    "statusCode": 200,
    "data": {
      "roles": [
        {
          "id": "69b53e07-b1c6-495a-9a6e-c419c138bb1e",
          "name": "estudiante",
          "description": "Rol para estudiantes del sistema"
        },
        {
          "id": "71da21ba-388c-4cf2-9519-2d113b4d6a36",
          "name": "orientador",
          "description": "Rol para orientadores vocacionales"
        }
      ]
    }
  }
  ```

---

### 9. Actualizar Rol de Usuario
Permite cambiar el rol de un usuario específico a otro rol existente en el sistema.

* **URL:** `/api/v1/auth/users/:userId/role`
* **Método:** `PATCH`
* **Cuerpo de la Petición:**
  ```json
  {
    "roleName": "orientador"
  }
  ```
* **Respuesta Exitosa (200 OK):**
  ```json
  {
    "status": "success",
    "statusCode": 200,
    "data": {
      "user": {
        "id": "e44146a8-27b0-4dbb-b2ab-63e2329bc0b6",
        "email": "juan.modificado@orientate.com",
        "name": "Juan Pérez Modificado",
        "roleName": "orientador",
        "isActive": true,
        "createdAt": "2026-06-19T01:50:00.000Z",
        "updatedAt": "2026-06-19T01:54:00.000Z"
      }
    }
  }
  ```

