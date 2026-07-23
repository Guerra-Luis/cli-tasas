# cli-tasas

CLI para consultar las tasas de interés y de cambio del mercado venezolano desde la terminal.

## Autor

- [Guerra-Luis](https://github.com/Guerra-Luis)

## Licencia

ISC

## Requisitos

- [Node.js](https://nodejs.org/) >= 18
- npm (u otro gestor de paquetes compatible)

## Instalación

### Uso local

Clona el repositorio y ejecuta:

```bash
npm install
```

Luego ejecuta la herramienta desde la raíz del proyecto:

```bash
node index.js
```

También puedes usar el comando registrado como binario:

```bash
tasa
```

### Instalación global

Si publicas el paquete en el registro de npm, podrás instalarlo globalmente:

```bash
npm install -g cli-tasas
```

Y usarlo desde cualquier ubicación:

```bash
tasa
```

## Uso

Ejecuta el comando `tasa` desde la terminal. Si no tienes configurada una API Key, la CLI te la solicitará de forma segura y la guardará localmente para futuras consultas.

La herramienta consultará los datos de las tasas disponibles y mostrará una tabla en consola con la información actual.

### Consulta por fecha

Puedes consultar las tasas del BCV de una fecha específica con el argumento `--date` (o su versión corta `-d`):

```bash
tasa --date 2024-06-15
```

El formato de fecha debe ser `aaaa-mm-dd`. Al proporcionar una fecha, la herramienta mostrará solo las tasas del BCV correspondientes a ese día.

```bash
# Forma corta
tasa -d 2024-06-15
```

## Configuración

Al primera ejecución se pedirá la API Key del servicio de [dolarvzla.com](https://www.dolarvzla.com/settings/api). Esta se almacena localmente de forma segura mediante el paquete [conf](https://www.npmjs.com/package/conf), por lo que no será necesario ingresarla nuevamente.

## Características

- Consulta tasas vigentes del mercado venezolano desde la terminal.
- Almacenamiento local persistente de la API Key.
- Visualización tabular de las tasas en la consola.

## Limitaciones conocidas

- Para consultar ciertos datos (como USDT) se requiere una API Key válida proporcionada por [dolarvzla.com](https://www.dolarvzla.com/settings/api).
- La disponibilidad de las tasas depende del servicio externo de [rates.dolarvzla.com](https://rates.dolarvzla.com).
