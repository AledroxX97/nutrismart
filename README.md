# NutriSmart+ — Frontend

Aplicación web desarrollada con Angular para presentar la interfaz de NutriSmart+ y los flujos principales de sus tres roles: administrador, nutricionista y paciente.

El frontend no consume la API de FastAPI ni la API auxiliar de Express: las pantallas trabajan con datos locales y `localStorage`. Esta separación permite demostrar la navegación y las funciones de interfaz sin depender de los servicios backend.

## Alcance actual

### Acceso y navegación por rol

La pantalla de acceso solicita correo, contraseña y rol. La validación se realiza localmente contra tres cuentas de demostración iniciales, que se guardan en `localStorage` bajo `nutrismart.demo.accounts`. Al iniciar sesión, el rol se conserva en `localStorage` bajo `nutrismart.demo.role`.

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `daniel@email.co` | `admin2026` |
| Nutricionista | `sebastian@email.co` | `nutri2026` |
| Paciente | `bryan.fernandez@email.co` | `paciente2026` |

Estas credenciales son ficticias y sirven solo para la demostración local. Al estar en el navegador, el mecanismo no ofrece seguridad real: no se deben usar contraseñas personales ni presentarlo como autenticación de producción.

Las rutas están protegidas por guards de navegación. `demoSessionGuard` lleva al acceso si no hay un rol seleccionado; `moduleAccessGuard` impide navegar a módulos que no pertenecen al menú del rol actual. Estos controles organizan la demostración en el navegador y no sustituyen la autorización que deberá implementar el backend.

| Rol | Módulos implementados | Módulos visibles en construcción |
|---|---|---|
| Administrador | Usuarios y roles, catálogo de alimentos, precios regionales | Reglas clínicas, documentos de apoyo |
| Nutricionista | Pacientes e historia, planes alimentarios, seguimiento, precios regionales | Agenda, asistente |
| Paciente | Mi plan, evolución, citas | Adherencia |

Los módulos de la última columna tienen entrada en la navegación, pero actualmente presentan una pantalla genérica. Se incluyen para mostrar el alcance previsto y la estructura de acceso por rol; no deben sustentarse como funcionalidades terminadas.

### Datos y persistencia local

- Los datos precargados se definen en servicios locales de cada funcionalidad.
- Las operaciones que ya están implementadas guardan cambios en el `localStorage` del navegador.
- Los cambios son propios del navegador y perfil donde se ejecuta la aplicación; no se sincronizan entre dispositivos ni se guardan en PostgreSQL/MySQL.
- Los datos personales y clínicos demostrativos son ficticios. Las fuentes de los datos de alimentos, precios y división geográfica están documentadas en [`../docs/fuentes-datos-precargados.md`](../docs/fuentes-datos-precargados.md).
- Para volver al estado inicial de demostración, borra los datos del sitio `localhost:4200` desde las herramientas de desarrollo del navegador. Al volver a cargar se recrearán los datos iniciales.

### Tablas y componentes compartidos

Las pantallas que muestran listados usan `ns-data-table`, una tabla reutilizable que ofrece búsqueda, ordenamiento por columna, paginación, selección de tamaño de página, mensajes para listas vacías y acciones por fila. Se utiliza en usuarios, alimentos, precios regionales, pacientes, detalle del paciente y controles de seguimiento.

El frontend contiene diez componentes compartidos:

| Componente | Responsabilidad |
|---|---|
| `app-brand` | Marca y nombre de la aplicación |
| `app-footer` | Pie de página |
| `confirm-dialog` | Confirmación de acciones |
| `data-table` | Listados con búsqueda, ordenamiento y paginación |
| `empty-state` | Estado visual sin registros |
| `metric-card` | Indicadores resumidos |
| `page-heading` | Título y contexto de las páginas |
| `paginador` | Controles de página reutilizables |
| `search-box` | Campo de búsqueda reutilizable |
| `status-badge` | Indicadores visuales de estado |

## Diseño adaptable

Las páginas y el espacio de trabajo cuentan con estilos CSS para ajustar la distribución a escritorio, tableta y móvil. El menú, las tarjetas, los formularios y las tablas contemplan anchos reducidos; en listados con muchas columnas se permite el desplazamiento horizontal para conservar la información.

## Tecnologías y decisiones de estructura

- Angular con componentes standalone y rutas con carga diferida.
- TypeScript para componentes, modelos y servicios de datos locales.
- CSS para los estilos.
- `localStorage` para la sesión de demostración y para los datos locales que admiten cambios.
- No se agregan `HttpClient`, llamadas `fetch` ni direcciones de API al frontend mientras rija el requisito de no conectar Angular con las APIs.

### Organización de carpetas

```text
src/app/
├── core/           # Roles, sesión local y guards
├── features/       # Funcionalidades agrupadas por rol y áreas comunes
│   ├── administrador/
│   ├── auth/
│   ├── comun/
│   ├── dashboard/
│   ├── nutricionista/
│   ├── paciente/
│   └── workspace/  # Vistas genéricas de módulos aún no desarrollados
├── layout/         # Estructura del portal, encabezado y menú lateral
└── shared/         # Componentes visuales reutilizables
```

En cada funcionalidad se separan páginas, modelos y servicios cuando aplica. Las páginas se encargan de presentar la interfaz; los servicios locales centralizan la lectura y actualización de sus datos.

## Ejecutar en local

Requisitos: Node.js y npm instalados.

Desde esta carpeta (`frontend`):

```powershell
npm install
npm start
```

Abre [http://localhost:4200](http://localhost:4200), ingresa las credenciales de demostración de la tabla y recorre los módulos del rol. Para terminar el servidor local, usa `Ctrl+C` en la terminal.

## Compilar

```powershell
npm run build
```

Angular genera los archivos de distribución en `dist/nutrismart-web/`. La compilación confirma que el proyecto puede construirse; por sí sola no publica la aplicación en un hosting.



## Scripts disponibles

| Comando | Uso |
|---|---|
| `npm start` | Inicia el servidor de desarrollo de Angular |
| `npm run build` | Compila la aplicación para distribución |
| `npm run watch` | Compila continuamente en modo desarrollo |
| `npm test` | Inicia el entorno de pruebas configurado para el proyecto |
