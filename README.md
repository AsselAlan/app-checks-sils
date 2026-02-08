# App de Checks SILS

Este proyecto es una aplicación React para gestionar checklists y generar PDFs firmados.

## Estructura
- **Checking Form**: Formulario dinámico basado en configuración.
- **Firmas Digitales**: Soporte para firmas de técnico y cliente.
- **Generación de PDF**: Rellenado automático de la plantilla PDF.

## Configuración
La configuración del checklist (items, secciones, campos) se encuentra en:
`frontend/src/utils/checklistConfig.ts`
Puedes editar este archivo para agregar o quitar items.

## Plantilla PDF
La plantilla utilizada es `frontend/public/checklist.pdf`.
Si deseas cambiarla, reemplaza este archivo manteniendo el nombre (o actualiza el código en `pdfGenerator.ts`).
Nota: El sistema intenta rellenar campos de formulario del PDF si existen. Si el PDF es plano, solo se añadirán las firmas (si se configura la posición) o se requerirá edición del código para dibujar texto en coordenadas específicas.

## Ejecución
1. Navega a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instala dependencias (si no lo has hecho):
   ```bash
   npm install
   ```
3. Inicia la aplicación:
   ```bash
   npm run dev
   ```
4. Abre el enlace local en tu navegador.
