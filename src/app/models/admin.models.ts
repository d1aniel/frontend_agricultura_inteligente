export type FieldType = 'text' | 'number' | 'email' | 'date' | 'datetime-local' | 'checkbox' | 'textarea' | 'select';

export interface AdminRelation {
  entityKey: string;
  valueField?: string;
  labelFields?: string[];
  createRoute?: string;
}

export interface AdminField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  relation?: AdminRelation;
}

export interface AdminEntity {
  key: string;
  route: string;
  endpoint: string;
  apiBasePath: 'api_usuarios' | 'api_ubicacion' | 'api_iot' | 'api_riego' | 'api_sistema';
  label: string;
  pluralLabel: string;
  app: 'usuarios' | 'ubicaciones' | 'iot' | 'riego' | 'sistema';
  idField: string;
  fields: AdminField[];
  sampleRows: Record<string, string | number | boolean>[];
}

const estadoUbicacion = ['ACTIVA', 'INACTIVA'];
const estadoBasico = ['ACTIVO', 'INACTIVO'];
const usuarioRelation: AdminRelation = {
  entityKey: 'usuario',
  valueField: 'usuario',
  labelFields: ['usuario', 'telefono', 'estado'],
  createRoute: 'usuarios'
};
const usuarioPerfilRelation: AdminRelation = {
  entityKey: 'usuario',
  labelFields: ['usuario', 'telefono', 'estado'],
  createRoute: 'usuarios'
};

export const ADMIN_ENTITIES: AdminEntity[] = [
  {
    key: 'organizacion',
    route: 'organizaciones',
    endpoint: 'organizaciones',
    apiBasePath: 'api_ubicacion',
    label: 'Organizacion',
    pluralLabel: 'Organizaciones',
    app: 'ubicaciones',
    idField: 'id',
    fields: [
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'nit_documento', label: 'NIT / documento', type: 'text' },
      { key: 'telefono', label: 'Telefono', type: 'text' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'direccion', label: 'Direccion', type: 'text' },
      { key: 'estado', label: 'Estado', type: 'select', options: estadoUbicacion }
    ],
    sampleRows: [
      { id: 1, nombre: 'AgroSmart Institucional', nit_documento: '900123456', telefono: '3005551234', email: 'admin@agrosmart.local', direccion: 'Santander', estado: 'ACTIVA' }
    ]
  },
  {
    key: 'finca',
    route: 'fincas',
    endpoint: 'fincas',
    apiBasePath: 'api_ubicacion',
    label: 'Finca',
    pluralLabel: 'Fincas',
    app: 'ubicaciones',
    idField: 'id',
    fields: [
      { key: 'organizacion', label: 'Organizacion', type: 'select', relation: { entityKey: 'organizacion', labelFields: ['nombre', 'nit_documento'], createRoute: 'organizaciones' } },
      { key: 'usuario', label: 'Usuario', type: 'select', relation: usuarioRelation },
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'ubicacion', label: 'Ubicacion', type: 'text', required: true },
      { key: 'latitud', label: 'Latitud', type: 'number' },
      { key: 'longitud', label: 'Longitud', type: 'number' },
      { key: 'area_total', label: 'Area total', type: 'number' },
      { key: 'unidad_area', label: 'Unidad', type: 'select', options: ['m2', 'hectareas', 'fanegadas'] },
      { key: 'estado', label: 'Estado', type: 'select', options: estadoUbicacion }
    ],
    sampleRows: [
      { id: 1, organizacion: 1, usuario: 1, nombre: 'Finca El Porvenir', ubicacion: 'Mesa de los Santos', area_total: 12, unidad_area: 'hectareas', estado: 'ACTIVA' }
    ]
  },
  {
    key: 'parcela',
    route: 'parcelas',
    endpoint: 'parcelas',
    apiBasePath: 'api_ubicacion',
    label: 'Parcela',
    pluralLabel: 'Parcelas',
    app: 'ubicaciones',
    idField: 'id',
    fields: [
      { key: 'finca', label: 'Finca', type: 'select', required: true, relation: { entityKey: 'finca', labelFields: ['nombre', 'ubicacion'], createRoute: 'fincas' } },
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'tipo_cultivo', label: 'Cultivo', type: 'text', required: true },
      { key: 'area', label: 'Area', type: 'number', required: true },
      { key: 'unidad_area', label: 'Unidad', type: 'select', options: ['m2', 'hectareas', 'fanegadas'] },
      { key: 'tipo_suelo', label: 'Tipo de suelo', type: 'text' },
      { key: 'descripcion', label: 'Descripcion', type: 'textarea' },
      { key: 'estado', label: 'Estado', type: 'select', options: estadoUbicacion }
    ],
    sampleRows: [
      { id: 1, finca: 1, nombre: 'Parcela Norte', tipo_cultivo: 'Tomate', area: 2, unidad_area: 'm2', tipo_suelo: 'Franco', estado: 'ACTIVA' }
    ]
  },
  {
    key: 'nodo_iot',
    route: 'nodos-iot',
    endpoint: 'nodos-iot',
    apiBasePath: 'api_iot',
    label: 'Nodo IoT',
    pluralLabel: 'Nodos IoT',
    app: 'iot',
    idField: 'id',
    fields: [
      { key: 'parcela', label: 'Parcela', type: 'select', relation: { entityKey: 'parcela', labelFields: ['nombre', 'tipo_cultivo'], createRoute: 'parcelas' } },
      { key: 'codigo_nodo', label: 'Codigo', type: 'text', required: true },
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'descripcion', label: 'Descripcion', type: 'textarea' },
      { key: 'ubicacion', label: 'Ubicacion', type: 'text' },
      { key: 'direccion_ip', label: 'Direccion IP', type: 'text' },
      { key: 'mac_address', label: 'MAC', type: 'text' },
      { key: 'fecha_instalacion', label: 'Instalacion', type: 'date' },
      { key: 'estado', label: 'Estado', type: 'select', options: ['ACTIVO', 'INACTIVO', 'MANTENIMIENTO', 'DESCONECTADO'] }
    ],
    sampleRows: [
      { id: 1, parcela: 1, codigo_nodo: 'ESP32-01', nombre: 'Nodo humedad suelo', direccion_ip: '192.168.1.45', mac_address: 'AA:BB:CC:10:20:30', estado: 'ACTIVO' }
    ]
  },
  {
    key: 'sensor',
    route: 'sensores',
    endpoint: 'sensores',
    apiBasePath: 'api_iot',
    label: 'Sensor',
    pluralLabel: 'Sensores',
    app: 'iot',
    idField: 'id',
    fields: [
      { key: 'nodo', label: 'Nodo', type: 'select', required: true, relation: { entityKey: 'nodo_iot', labelFields: ['nombre', 'codigo_nodo'], createRoute: 'nodos-iot' } },
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'tipo_sensor', label: 'Tipo', type: 'select', required: true, options: ['TEMPERATURA', 'HUMEDAD_AMBIENTE', 'HUMEDAD_SUELO', 'LLUVIA', 'LUZ'] },
      { key: 'modelo', label: 'Modelo', type: 'text' },
      { key: 'unidad_medida', label: 'Unidad', type: 'text', required: true },
      { key: 'pin_conexion', label: 'Pin', type: 'text' },
      { key: 'valor_minimo', label: 'Valor minimo', type: 'number' },
      { key: 'valor_maximo', label: 'Valor maximo', type: 'number' },
      { key: 'estado', label: 'Estado', type: 'select', options: ['ACTIVO', 'INACTIVO', 'DANADO'] },
      { key: 'fecha_instalacion', label: 'Instalacion', type: 'date' }
    ],
    sampleRows: [
      { id: 1, nodo: 1, nombre: 'DHT11 ambiente', tipo_sensor: 'HUMEDAD_AMBIENTE', modelo: 'DHT11', unidad_medida: '%', estado: 'ACTIVO' }
    ]
  },
  {
    key: 'lectura_sensor',
    route: 'lecturas-sensor',
    endpoint: 'lecturas-sensor',
    apiBasePath: 'api_iot',
    label: 'Lectura de sensor',
    pluralLabel: 'Lecturas de sensores',
    app: 'iot',
    idField: 'id',
    fields: [
      { key: 'sensor', label: 'Sensor', type: 'select', required: true, relation: { entityKey: 'sensor', labelFields: ['nombre', 'tipo_sensor'], createRoute: 'sensores' } },
      { key: 'valor', label: 'Valor', type: 'number', required: true },
      { key: 'unidad_medida', label: 'Unidad', type: 'text', required: true },
      { key: 'calidad_dato', label: 'Calidad', type: 'select', options: ['VALIDO', 'SOSPECHOSO', 'ERROR'] },
      { key: 'observacion', label: 'Observacion', type: 'textarea' }
    ],
    sampleRows: [
      { id: 1, sensor: 1, valor: 42, unidad_medida: '%', calidad_dato: 'VALIDO' }
    ]
  },
  {
    key: 'actuador',
    route: 'actuadores',
    endpoint: 'actuadores',
    apiBasePath: 'api_iot',
    label: 'Actuador',
    pluralLabel: 'Actuadores',
    app: 'iot',
    idField: 'id',
    fields: [
      { key: 'nodo', label: 'Nodo', type: 'select', required: true, relation: { entityKey: 'nodo_iot', labelFields: ['nombre', 'codigo_nodo'], createRoute: 'nodos-iot' } },
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'tipo_actuador', label: 'Tipo', type: 'select', options: ['RELE', 'BOMBA', 'VALVULA', 'MOTOR'] },
      { key: 'modelo', label: 'Modelo', type: 'text' },
      { key: 'pin_conexion', label: 'Pin', type: 'text' },
      { key: 'estado_actual', label: 'Estado actual', type: 'select', options: ['ENCENDIDO', 'APAGADO', 'ERROR'] },
      { key: 'fecha_instalacion', label: 'Instalacion', type: 'date' },
      { key: 'estado', label: 'Estado', type: 'select', options: ['ACTIVO', 'INACTIVO', 'MANTENIMIENTO'] }
    ],
    sampleRows: [
      { id: 1, nodo: 1, nombre: 'Bomba principal', tipo_actuador: 'RELE', pin_conexion: 'GPIO 26', estado_actual: 'APAGADO', estado: 'ACTIVO' }
    ]
  },
  {
    key: 'estado_riego',
    route: 'estados-riego',
    endpoint: 'estados-riego',
    apiBasePath: 'api_riego',
    label: 'Estado de riego',
    pluralLabel: 'Estados de riego',
    app: 'riego',
    idField: 'id',
    fields: [
      { key: 'actuador', label: 'Actuador', type: 'select', required: true, relation: { entityKey: 'actuador', labelFields: ['nombre', 'tipo_actuador'], createRoute: 'actuadores' } },
      { key: 'estado', label: 'Estado', type: 'select', required: true, options: ['ENCENDIDO', 'APAGADO'] },
      { key: 'modo', label: 'Modo', type: 'select', required: true, options: ['AUTOMATICO', 'MANUAL', 'DISPOSITIVO'] },
      { key: 'fecha_hora_fin', label: 'Fin', type: 'datetime-local' },
      { key: 'duracion_segundos', label: 'Duracion segundos', type: 'number' },
      { key: 'motivo', label: 'Motivo', type: 'text' }
    ],
    sampleRows: [
      { id: 1, actuador: 1, estado: 'APAGADO', modo: 'MANUAL', duracion_segundos: 120, motivo: 'Comando manual' }
    ]
  },
  {
    key: 'regla_riego_automatico',
    route: 'reglas-riego',
    endpoint: 'reglas-riego',
    apiBasePath: 'api_riego',
    label: 'Regla de riego automatico',
    pluralLabel: 'Reglas de riego automatico',
    app: 'riego',
    idField: 'id',
    fields: [
      { key: 'parcela', label: 'Parcela', type: 'select', required: true, relation: { entityKey: 'parcela', labelFields: ['nombre', 'tipo_cultivo'], createRoute: 'parcelas' } },
      { key: 'actuador', label: 'Actuador', type: 'select', required: true, relation: { entityKey: 'actuador', labelFields: ['nombre', 'tipo_actuador'], createRoute: 'actuadores' } },
      { key: 'sensor_humedad', label: 'Sensor humedad', type: 'select', required: true, relation: { entityKey: 'sensor', labelFields: ['nombre', 'tipo_sensor'], createRoute: 'sensores' } },
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'humedad_encendido', label: 'Humedad encendido', type: 'number' },
      { key: 'humedad_apagado', label: 'Humedad apagado', type: 'number' },
      { key: 'activa', label: 'Activa', type: 'checkbox' },
      { key: 'descripcion', label: 'Descripcion', type: 'textarea' }
    ],
    sampleRows: [
      { id: 1, parcela: 1, actuador: 1, sensor_humedad: 1, nombre: 'Riego tomate norte', humedad_encendido: 15, humedad_apagado: 80, activa: true }
    ]
  },
  {
    key: 'comando_riego',
    route: 'comandos-riego',
    endpoint: 'comandos-riego',
    apiBasePath: 'api_riego',
    label: 'Comando de riego',
    pluralLabel: 'Comandos de riego',
    app: 'riego',
    idField: 'id',
    fields: [
      { key: 'actuador', label: 'Actuador', type: 'select', required: true, relation: { entityKey: 'actuador', labelFields: ['nombre', 'tipo_actuador'], createRoute: 'actuadores' } },
      { key: 'usuario', label: 'Usuario', type: 'select', relation: usuarioPerfilRelation },
      { key: 'regla', label: 'Regla', type: 'select', relation: { entityKey: 'regla_riego_automatico', labelFields: ['nombre'], createRoute: 'reglas-riego' } },
      { key: 'comando', label: 'Comando', type: 'select', required: true, options: ['ENCENDER', 'APAGAR', 'REINICIAR'] },
      { key: 'origen', label: 'Origen', type: 'select', required: true, options: ['MANUAL', 'AUTOMATICO', 'DISPOSITIVO', 'SISTEMA'] },
      { key: 'estado_comando', label: 'Estado', type: 'select', options: ['PENDIENTE', 'ENVIADO', 'EJECUTADO', 'FALLIDO'] }
    ],
    sampleRows: [
      { id: 1, actuador: 1, usuario: 1, comando: 'APAGAR', origen: 'MANUAL', estado_comando: 'EJECUTADO' }
    ]
  },
  {
    key: 'respuesta_comando',
    route: 'respuestas-comando',
    endpoint: 'respuestas-comando',
    apiBasePath: 'api_riego',
    label: 'Respuesta de comando',
    pluralLabel: 'Respuestas de comandos',
    app: 'riego',
    idField: 'id',
    fields: [
      { key: 'comando', label: 'Comando', type: 'select', required: true, relation: { entityKey: 'comando_riego', labelFields: ['comando', 'estado_comando'], createRoute: 'comandos-riego' } },
      { key: 'respuesta', label: 'Respuesta', type: 'text', required: true },
      { key: 'mensaje', label: 'Mensaje', type: 'textarea' },
      { key: 'codigo_error', label: 'Codigo error', type: 'text' }
    ],
    sampleRows: [
      { id: 1, comando: 1, respuesta: 'OK', mensaje: 'Comando ejecutado', codigo_error: '' }
    ]
  },
  {
    key: 'usuario',
    route: 'usuarios',
    endpoint: 'usuarios',
    apiBasePath: 'api_usuarios',
    label: 'Usuario',
    pluralLabel: 'Usuarios',
    app: 'usuarios',
    idField: 'id',
    fields: [
      { key: 'usuario', label: 'Usuario auth', type: 'number', required: true },
      { key: 'organizacion', label: 'Organizacion', type: 'select', relation: { entityKey: 'organizacion', labelFields: ['nombre', 'nit_documento'], createRoute: 'organizaciones' } },
      { key: 'telefono', label: 'Telefono', type: 'text' },
      { key: 'estado', label: 'Estado', type: 'select', options: ['ACTIVO', 'INACTIVO', 'BLOQUEADO'] }
    ],
    sampleRows: [
      { id: 1, usuario: 1, organizacion: 1, telefono: '3005551234', estado: 'ACTIVO' }
    ]
  },
  {
    key: 'rol',
    route: 'roles',
    endpoint: 'roles',
    apiBasePath: 'api_usuarios',
    label: 'Rol',
    pluralLabel: 'Roles',
    app: 'usuarios',
    idField: 'id',
    fields: [
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'descripcion', label: 'Descripcion', type: 'textarea' },
      { key: 'estado', label: 'Estado', type: 'select', options: estadoBasico }
    ],
    sampleRows: [
      { id: 1, nombre: 'Administrador', descripcion: 'Acceso completo al sistema', estado: 'ACTIVO' }
    ]
  },
  {
    key: 'usuario_rol',
    route: 'usuario-roles',
    endpoint: 'usuario-roles',
    apiBasePath: 'api_usuarios',
    label: 'Usuario rol',
    pluralLabel: 'Usuarios roles',
    app: 'usuarios',
    idField: 'id',
    fields: [
      { key: 'usuario', label: 'Usuario', type: 'select', required: true, relation: usuarioPerfilRelation },
      { key: 'rol', label: 'Rol', type: 'select', required: true, relation: { entityKey: 'rol', labelFields: ['nombre'], createRoute: 'roles' } },
      { key: 'asignado_por', label: 'Asignado por', type: 'select', relation: usuarioPerfilRelation },
      { key: 'estado', label: 'Estado', type: 'select', options: estadoBasico }
    ],
    sampleRows: [
      { id: 1, usuario: 1, rol: 1, asignado_por: 1, estado: 'ACTIVO' }
    ]
  },
  {
    key: 'alerta_sistema',
    route: 'alertas-sistema',
    endpoint: 'alertas-sistema',
    apiBasePath: 'api_sistema',
    label: 'Alerta del sistema',
    pluralLabel: 'Alertas del sistema',
    app: 'sistema',
    idField: 'id',
    fields: [
      { key: 'nodo', label: 'Nodo', type: 'select', relation: { entityKey: 'nodo_iot', labelFields: ['nombre', 'codigo_nodo'], createRoute: 'nodos-iot' } },
      { key: 'sensor', label: 'Sensor', type: 'select', relation: { entityKey: 'sensor', labelFields: ['nombre', 'tipo_sensor'], createRoute: 'sensores' } },
      { key: 'actuador', label: 'Actuador', type: 'select', relation: { entityKey: 'actuador', labelFields: ['nombre', 'tipo_actuador'], createRoute: 'actuadores' } },
      { key: 'tipo_alerta', label: 'Tipo', type: 'text', required: true },
      { key: 'severidad', label: 'Severidad', type: 'select', required: true, options: ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'] },
      { key: 'mensaje', label: 'Mensaje', type: 'textarea', required: true },
      { key: 'estado', label: 'Estado', type: 'select', options: ['ABIERTA', 'ATENDIDA', 'CERRADA'] },
      { key: 'atendida_por', label: 'Atendida por', type: 'select', relation: usuarioPerfilRelation },
      { key: 'fecha_atencion', label: 'Fecha atencion', type: 'datetime-local' }
    ],
    sampleRows: [
      { id: 1, tipo_alerta: 'Humedad baja', severidad: 'ALTA', mensaje: 'Humedad por debajo del 15%', estado: 'ABIERTA', atendida_por: '' }
    ]
  },
  {
    key: 'auditoria_sistema',
    route: 'auditorias-sistema',
    endpoint: 'auditorias-sistema',
    apiBasePath: 'api_sistema',
    label: 'Auditoria del sistema',
    pluralLabel: 'Auditorias del sistema',
    app: 'sistema',
    idField: 'id',
    fields: [
      { key: 'usuario', label: 'Usuario', type: 'select', relation: usuarioPerfilRelation },
      { key: 'tabla_afectada', label: 'Tabla afectada', type: 'text', required: true },
      { key: 'id_registro_afectado', label: 'Registro afectado', type: 'number' },
      { key: 'accion', label: 'Accion', type: 'select', required: true, options: ['CREAR', 'ACTUALIZAR', 'ELIMINAR', 'INICIAR_SESION', 'ENVIAR_COMANDO'] },
      { key: 'descripcion', label: 'Descripcion', type: 'textarea', required: true },
      { key: 'direccion_ip', label: 'Direccion IP', type: 'text' }
    ],
    sampleRows: [
      { id: 1, usuario: 1, tabla_afectada: 'comando_riego', accion: 'ENVIAR_COMANDO', descripcion: 'Apagar bomba principal', direccion_ip: '127.0.0.1' }
    ]
  }
];

export function findAdminEntity(routeOrKey: string | null | undefined): AdminEntity {
  return ADMIN_ENTITIES.find((entity) => entity.route === routeOrKey || entity.key === routeOrKey) ?? ADMIN_ENTITIES[0];
}
