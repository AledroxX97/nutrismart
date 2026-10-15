export type TipoOtorgante = 'PACIENTE' | 'REPRESENTANTE';
export type ZonaPaciente = 'URBANA' | 'RURAL';

export interface DatosConsentimientoPaciente {
  version_texto: string;
  fecha_aceptacion: string;
  otorgado_por: string;
  tipo_otorgante: TipoOtorgante;
}

export interface FormularioPaciente {
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  sexo: string | null;
  municipio_divipola: string;
  zona: ZonaPaciente;
  estrato: number | null;
  presupuesto_semanal_cop: number | null;
  consentimiento: DatosConsentimientoPaciente;
}

export interface PacienteDemo {
  id: number;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  sexo: string | null;
  municipio_divipola: string;
  zona: ZonaPaciente | null;
  estrato: number | null;
  presupuesto_semanal_cop: number | null;
  consentimiento_version: string;
  consentimiento_fecha: string;
  consentimiento_otorgado_por: string;
  consentimiento_tipo_otorgante: TipoOtorgante;
  estado: boolean;
  creado: string;
  actualizado: string;
  motivo_anulacion?: string;
}

export interface OpcionMunicipio {
  codigo: string;
  nombre: string;
}
