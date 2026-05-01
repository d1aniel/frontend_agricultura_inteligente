export type FieldType = 'text' | 'number' | 'email' | 'date' | 'datetime-local' | 'checkbox' | 'textarea' | 'select';

export interface AdminField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
}

export interface AdminEntity {
  key: string;
  route: string;
  endpoint: string;
  label: string;
  pluralLabel: string;
  app: 'usuarios' | 'ubicaciones' | 'iot' | 'riego' | 'sistema';
  idField: string;
  fields: AdminField[];
  sampleRows: Record<string, string | number | boolean>[];
}

export const ADMIN_ENTITIES: AdminEntity[] = [
  {
    key: 'organizacion',
    route: 'organizaciones',
    endpoint: 'organizaciones',
    label: 'Organizacion',
    pluralLabel: 'Organizaciones',
    app: 'ubicaciones',
    idField: 'id_organizacion',
    fields: [
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'nit_documento', label: 'NIT / documento', type: 'text' },
      { key: 'telefono', label: 'Telefono', type: 'text' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'direccion', label: 'Direccion', type: 'text' },
      { key: 'estado', label: 'Estado', type: 'select', options: ['Activa', 'Inactiva'] }
    ],
    sampleRows: [
      { id_organizacion: 1, nombre: 'AgroSmart Institucional', nit_documento: '900123456', telefono: '3005551234', email: 'admin@agrosmart.local', direccion: 'Santander', estado: 'Activa' }
    ]
  },
  {
    key: 'finca',
    route: 'fincas',
    endpoint: 'fincas',
    label: 'Finca',
    pluralLabel: 'Fincas',
    app: 'ubicaciones',
    idField: 'id_finca',
    fields: [
      { key: 'id_organizacion', label: 'Organizacion', type: 'number', required: true },
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'ubicacion', label: 'Ubicacion', type: 'text', required: true },
      { key: 'area_total', label: 'Area total', type: 'number' },
      { key: 'unidad_area', label: 'Unidad', type: 'select', options: ['m2', 'hectareas', 'fanegadas'] },
      { key: 'estado', label: 'Estado', type: 'select', options: ['Activa', 'Inactiva'] }
    ],
    sampleRows: [
      { id_finca: 1, id_organizacion: 1, nombre: 'Finca El Porvenir', ubicacion: 'Mesa de los Santos', area_total: 12, unidad_area: 'hectareas', estado: 'Activa' }
    ]
  },
  {
    key: 'parcela',
    route: 'parcelas',
    endpoint: 'parcelas',
    label: 'Parcela',
    pluralLabel: 'Parcelas',
    app: 'ubicaciones',
    idField: 'id_parcela',
    fields: [
      { key: 'id_finca', label: 'Finca', type: 'number', required: true },
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'tipo_cultivo', label: 'Cultivo', type: 'text' },
      { key: 'area', label: 'Area', type: 'number' },
      { key: 'tipo_suelo', label: 'Tipo de suelo', type: 'text' },
      { key: 'estado', label: 'Estado', type: 'select', options: ['Activa', 'Inactiva'] }
    ],
    sampleRows: [
      { id_parcela: 1, id_finca: 1, nombre: 'Parcela Norte', tipo_cultivo: 'Tomate', area: 2, tipo_suelo: 'Franco', estado: 'Activa' }
    ]
  },
  {
    key: 'nodo_iot',
    route: 'nodos-iot',
    endpoint: 'nodos-iot',
    label: 'Nodo IoT',
    pluralLabel: 'Nodos IoT',
    app: 'iot',
    idField: 'id_nodo',
    fields: [
      { key: 'id_parcela', label: 'Parcela', type: 'number', required: true },
      { key: 'codigo_nodo', label: 'Codigo', type: 'text', required: true },
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'direccion_ip', label: 'Direccion IP', type: 'text' },
      { key: 'mac_address', label: 'MAC', type: 'text' },
      { key: 'estado', label: 'Estado', type: 'select', options: ['Activo', 'Inactivo', 'Mantenimiento', 'Desconectado'] }
    ],
    sampleRows: [
      { id_nodo: 1, id_parcela: 1, codigo_nodo: 'ESP32-01', nombre: 'Nodo humedad suelo', direccion_ip: '192.168.1.45', mac_address: 'AA:BB:CC:10:20:30', estado: 'Activo' }
    ]
  },
  {
    key: 'sensor',
    route: 'sensores',
    endpoint: 'sensores',
    label: 'Sensor',
    pluralLabel: 'Sensores',
    app: 'iot',
    idField: 'id_sensor',
    fields: [
      { key: 'id_nodo', label: 'Nodo', type: 'number', required: true },
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'tipo_sensor', label: 'Tipo', type: 'select', options: ['Temperatura', 'humedad_ambiente', 'humedad_suelo', 'lluvia'] },
      { key: 'modelo', label: 'Modelo', type: 'text' },
      { key: 'unidad_medida', label: 'Unidad', type: 'text' },
      { key: 'estado', label: 'Estado', type: 'select', options: ['Activo', 'Inactivo', 'Danado'] }
    ],
    sampleRows: [
      { id_sensor: 1, id_nodo: 1, nombre: 'DHT11 ambiente', tipo_sensor: 'humedad_ambiente', modelo: 'DHT11', unidad_medida: '%', estado: 'Activo' }
    ]
  },
  {
    key: 'lectura_sensor',
    route: 'lecturas-sensores',
    endpoint: 'lecturas-sensores',
    label: 'Lectura de sensor',
    pluralLabel: 'Lecturas de sensores',
    app: 'iot',
    idField: 'id_lectura',
    fields: [
      { key: 'id_sensor', label: 'Sensor', type: 'number', required: true },
      { key: 'valor', label: 'Valor', type: 'number', required: true },
      { key: 'unidad_medida', label: 'Unidad', type: 'text' },
      { key: 'fecha_hora', label: 'Fecha y hora', type: 'datetime-local' },
      { key: 'calidad_dato', label: 'Calidad', type: 'select', options: ['Valido', 'Sospechoso', 'Error'] }
    ],
    sampleRows: [
      { id_lectura: 1, id_sensor: 1, valor: 42, unidad_medida: '%', fecha_hora: '2026-04-27T10:18', calidad_dato: 'Valido' }
    ]
  },
  {
    key: 'actuador',
    route: 'actuadores',
    endpoint: 'actuadores',
    label: 'Actuador',
    pluralLabel: 'Actuadores',
    app: 'iot',
    idField: 'id_actuador',
    fields: [
      { key: 'id_nodo', label: 'Nodo', type: 'number', required: true },
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'tipo_actuador', label: 'Tipo', type: 'select', options: ['Rele', 'Bomba', 'Valvula', 'Motor'] },
      { key: 'pin_conexion', label: 'Pin', type: 'text' },
      { key: 'estado_actual', label: 'Estado actual', type: 'select', options: ['Encendido', 'Apagado', 'Error'] },
      { key: 'estado', label: 'Estado', type: 'select', options: ['Activo', 'Inactivo', 'Mantenimiento'] }
    ],
    sampleRows: [
      { id_actuador: 1, id_nodo: 1, nombre: 'Bomba principal', tipo_actuador: 'Rele', pin_conexion: 'GPIO 26', estado_actual: 'Apagado', estado: 'Activo' }
    ]
  },
  {
    key: 'estado_riego',
    route: 'estados-riego',
    endpoint: 'estados-riego',
    label: 'Estado de riego',
    pluralLabel: 'Estados de riego',
    app: 'riego',
    idField: 'id_estado_riego',
    fields: [
      { key: 'id_actuador', label: 'Actuador', type: 'number', required: true },
      { key: 'estado', label: 'Estado', type: 'select', options: ['Encendido', 'Apagado'] },
      { key: 'modo', label: 'Modo', type: 'select', options: ['Automatico', 'Manual', 'Programado'] },
      { key: 'fecha_hora_inicio', label: 'Inicio', type: 'datetime-local' },
      { key: 'duracion_segundos', label: 'Duracion segundos', type: 'number' },
      { key: 'motivo', label: 'Motivo', type: 'text' }
    ],
    sampleRows: [
      { id_estado_riego: 1, id_actuador: 1, estado: 'Apagado', modo: 'Manual', fecha_hora_inicio: '2026-04-27T09:00', duracion_segundos: 120, motivo: 'Comando manual' }
    ]
  },
  {
    key: 'regla_riego_automatico',
    route: 'reglas-riego-automatico',
    endpoint: 'reglas-riego-automatico',
    label: 'Regla de riego automatico',
    pluralLabel: 'Reglas de riego automatico',
    app: 'riego',
    idField: 'id_regla',
    fields: [
      { key: 'id_parcela', label: 'Parcela', type: 'number', required: true },
      { key: 'id_actuador', label: 'Actuador', type: 'number', required: true },
      { key: 'id_sensor_humedad', label: 'Sensor humedad', type: 'number', required: true },
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'humedad_encendido', label: 'Humedad encendido', type: 'number' },
      { key: 'humedad_apagado', label: 'Humedad apagado', type: 'number' },
      { key: 'activa', label: 'Activa', type: 'checkbox' }
    ],
    sampleRows: [
      { id_regla: 1, id_parcela: 1, id_actuador: 1, id_sensor_humedad: 1, nombre: 'Riego tomate norte', humedad_encendido: 15, humedad_apagado: 80, activa: true }
    ]
  },
  {
    key: 'comando_riego',
    route: 'comandos-riego',
    endpoint: 'comandos-riego',
    label: 'Comando de riego',
    pluralLabel: 'Comandos de riego',
    app: 'riego',
    idField: 'id_comando',
    fields: [
      { key: 'id_actuador', label: 'Actuador', type: 'number', required: true },
      { key: 'id_usuario', label: 'Usuario', type: 'number' },
      { key: 'comando', label: 'Comando', type: 'select', options: ['Encender', 'Apagar', 'Reiniciar'] },
      { key: 'origen', label: 'Origen', type: 'select', options: ['Manual', 'Automatico', 'Dispositivo', 'Sistema'] },
      { key: 'estado_comando', label: 'Estado', type: 'select', options: ['Pendiente', 'Enviado', 'Ejecutado', 'Fallido'] }
    ],
    sampleRows: [
      { id_comando: 1, id_actuador: 1, id_usuario: 1, comando: 'Apagar', origen: 'Manual', estado_comando: 'Ejecutado' }
    ]
  },
  {
    key: 'respuesta_comando',
    route: 'respuestas-comandos',
    endpoint: 'respuestas-comandos',
    label: 'Respuesta de comando',
    pluralLabel: 'Respuestas de comandos',
    app: 'riego',
    idField: 'id_respuesta',
    fields: [
      { key: 'id_comando', label: 'Comando', type: 'number', required: true },
      { key: 'respuesta', label: 'Respuesta', type: 'text', required: true },
      { key: 'mensaje', label: 'Mensaje', type: 'textarea' },
      { key: 'codigo_error', label: 'Codigo error', type: 'text' },
      { key: 'fecha_hora_respuesta', label: 'Fecha respuesta', type: 'datetime-local' }
    ],
    sampleRows: [
      { id_respuesta: 1, id_comando: 1, respuesta: 'OK', mensaje: 'Comando ejecutado', codigo_error: '', fecha_hora_respuesta: '2026-04-27T10:22' }
    ]
  },
  {
    key: 'usuario',
    route: 'usuarios',
    endpoint: 'usuarios',
    label: 'Usuario',
    pluralLabel: 'Usuarios',
    app: 'usuarios',
    idField: 'id_usuario',
    fields: [
      { key: 'id_organizacion', label: 'Organizacion', type: 'number', required: true },
      { key: 'nombres', label: 'Nombres', type: 'text', required: true },
      { key: 'apellidos', label: 'Apellidos', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'telefono', label: 'Telefono', type: 'text' },
      { key: 'estado', label: 'Estado', type: 'select', options: ['Activo', 'Inactivo', 'Bloqueado'] }
    ],
    sampleRows: [
      { id_usuario: 1, id_organizacion: 1, nombres: 'Admin', apellidos: 'Riego', email: 'admin@agrosmart.local', telefono: '3005551234', estado: 'Activo' }
    ]
  },
  {
    key: 'rol',
    route: 'roles',
    endpoint: 'roles',
    label: 'Rol',
    pluralLabel: 'Roles',
    app: 'usuarios',
    idField: 'id_rol',
    fields: [
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'descripcion', label: 'Descripcion', type: 'textarea' },
      { key: 'estado', label: 'Estado', type: 'select', options: ['Activo', 'Inactivo'] }
    ],
    sampleRows: [
      { id_rol: 1, nombre: 'Administrador', descripcion: 'Acceso completo al sistema', estado: 'Activo' }
    ]
  },
  {
    key: 'usuario_rol',
    route: 'usuarios-roles',
    endpoint: 'usuarios-roles',
    label: 'Usuario rol',
    pluralLabel: 'Usuarios roles',
    app: 'usuarios',
    idField: 'id_usuario_rol',
    fields: [
      { key: 'id_usuario', label: 'Usuario', type: 'number', required: true },
      { key: 'id_rol', label: 'Rol', type: 'number', required: true },
      { key: 'fecha_asignacion', label: 'Fecha asignacion', type: 'datetime-local' },
      { key: 'asignado_por', label: 'Asignado por', type: 'number' },
      { key: 'estado', label: 'Estado', type: 'select', options: ['Activo', 'Inactivo'] }
    ],
    sampleRows: [
      { id_usuario_rol: 1, id_usuario: 1, id_rol: 1, fecha_asignacion: '2026-04-27T08:00', asignado_por: 1, estado: 'Activo' }
    ]
  },
  {
    key: 'alerta_sistema',
    route: 'alertas-sistema',
    endpoint: 'alertas-sistema',
    label: 'Alerta del sistema',
    pluralLabel: 'Alertas del sistema',
    app: 'sistema',
    idField: 'id_alerta',
    fields: [
      { key: 'tipo_alerta', label: 'Tipo', type: 'text', required: true },
      { key: 'severidad', label: 'Severidad', type: 'select', options: ['Baja', 'Media', 'Alta', 'Critica'] },
      { key: 'mensaje', label: 'Mensaje', type: 'textarea', required: true },
      { key: 'estado', label: 'Estado', type: 'select', options: ['Abierta', 'Atendida', 'Cerrada'] },
      { key: 'atendida_por', label: 'Atendida por', type: 'number' }
    ],
    sampleRows: [
      { id_alerta: 1, tipo_alerta: 'Humedad baja', severidad: 'Alta', mensaje: 'Humedad por debajo del 15%', estado: 'Abierta', atendida_por: '' }
    ]
  },
  {
    key: 'auditoria_sistema',
    route: 'auditorias-sistema',
    endpoint: 'auditorias-sistema',
    label: 'Auditoria del sistema',
    pluralLabel: 'Auditorias del sistema',
    app: 'sistema',
    idField: 'id_auditoria',
    fields: [
      { key: 'id_usuario', label: 'Usuario', type: 'number' },
      { key: 'tabla_afectada', label: 'Tabla afectada', type: 'text', required: true },
      { key: 'accion', label: 'Accion', type: 'select', options: ['Crear', 'Actualizar', 'Eliminar', 'iniciar_sesion', 'enviar_comando'] },
      { key: 'descripcion', label: 'Descripcion', type: 'textarea', required: true },
      { key: 'direccion_ip', label: 'Direccion IP', type: 'text' }
    ],
    sampleRows: [
      { id_auditoria: 1, id_usuario: 1, tabla_afectada: 'comando_riego', accion: 'enviar_comando', descripcion: 'Apagar bomba principal', direccion_ip: '127.0.0.1' }
    ]
  }
];

export function findAdminEntity(routeOrKey: string | null | undefined): AdminEntity {
  return ADMIN_ENTITIES.find((entity) => entity.route === routeOrKey || entity.key === routeOrKey) ?? ADMIN_ENTITIES[0];
}
