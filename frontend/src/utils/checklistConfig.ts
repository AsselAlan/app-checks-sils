export interface ChecklistItem {
  id: string;
  label: string;
  type: 'evaluation_row'; // Custom type for the row with Apto/No Apto + Observation
}

export interface ChecklistField {
  name: string;
  label: string;
  type: 'text' | 'date' | 'datetime-local' | 'textarea';
}

export interface ChecklistSection {
  title: string;
  fields?: ChecklistField[];
  items?: ChecklistItem[];
  signatures?: { id: string; label: string }[];
}

export const checklistConfig: { title: string; sections: ChecklistSection[] } = {
  title: "Checklist de Instalación TLK",
  sections: [
    {
      title: "Encabezado / Datos Generales",
      fields: [
        { name: "fecha_hora", label: "Fecha y Hora", type: "datetime-local" },
        { name: "transportista", label: "Transportista", type: "text" },
        { name: "responsable_silstech", label: "Responsable Silstech", type: "text" },
        // Firma y Aclaración is usually the signature line, handled at bottom or implicitly here? 
        // The PDF shows it right in header. We can put a signature field here or keep data separate.
        // Let's keep data fields here.
        { name: "dominio_interno_tc", label: "Dominio/Interno TC", type: "text" },
        { name: "dominio_sr", label: "Dominio SR", type: "text" },
        // "Equipamiento: Teltonika" seems static or a default value
      ],
    },
    {
      title: "Tractor (Evaluación General Interior y Exterior)",
      items: [
        { id: "tractor_encendido", label: "Encendido y Cortacorrientes", type: "evaluation_row" },
        { id: "tractor_fallas_tablero", label: "Mensajes de Fallas en Tablero", type: "evaluation_row" },
        { id: "tractor_parabrisas_luces", label: "Parabrisas, Luces, Guiños", type: "evaluation_row" },
        { id: "tractor_tacografo", label: "Tacógrafo y Vigia", type: "evaluation_row" },
        { id: "tractor_zona_trasera", label: "Zona Trasera de Conectores", type: "evaluation_row" },
      ],
    },
    {
      title: "Instalación TLK (Evaluación General)",
      items: [
        { id: "tlk_alimentacion", label: "Correcta Toma de Alimentación en Fusiblera", type: "evaluation_row" },
        { id: "tlk_empalmes", label: "Empalmes (Soldados, Aislados)", type: "evaluation_row" },
        { id: "tlk_cables", label: "Cables Periféricos Prolijos y Precintados", type: "evaluation_row" },
        { id: "tlk_antena", label: "Antena Bien Orientada y Pegada", type: "evaluation_row" },
        { id: "tlk_funcionamiento", label: "Control de Correcto Funcionamiento", type: "evaluation_row" },
      ],
    },
    {
      title: "Firmas",
      fields: [
        { name: "nombre_representante", label: "Nombre y Apellido del Representante", type: "text" }
      ],
      signatures: [
        { id: "firma_responsable_silstech", label: "Firma y Aclaración (Responsable Silstech)" },
        { id: "firma_representante_transportista", label: "Firma (Representante de Transportista)" },
      ],
    },
  ],
};
