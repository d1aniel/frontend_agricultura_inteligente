import { Component, OnDestroy, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ADMIN_ENTITIES, AdminEntity } from '../../models/admin.models';
import { AdminApiService, AdminPayload } from '../../services/admin-api.service';
import { AuthService } from '../../services/auth.service';

type IrrigationState = 'Encendido' | 'Apagado' | 'Automatico';

interface DashboardMetric {
  label: string;
  value: string;
  detail: string;
  status: 'ok' | 'warn' | 'danger';
}

interface DashboardAlert {
  type: string;
  severity: string;
  source: string;
  message: string;
  time: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnDestroy {
  protected readonly entities = computed(() =>
    ADMIN_ENTITIES.filter((entity) =>
      entity.hideFromNavigation !== true
      && this.auth.hasActiveRole
      && (!entity.requiresAdministrativeRole || this.auth.hasAdministrativeRole)
    )
  );
  protected readonly hasActiveRole = computed(() => this.auth.hasActiveRole);
  protected readonly hasAdministrativeRole = computed(() => this.auth.hasAdministrativeRole);
  protected readonly irrigationState = signal<IrrigationState>('Apagado');
  protected readonly commandStatus = signal('Sin comandos pendientes');
  protected readonly actuatorId = signal<number | null>(null);
  protected readonly sensorsLoaded = signal(false);
  protected readonly hasSoilSensor = signal(false);
  protected readonly soilSensors = signal<AdminPayload[]>([]);
  protected readonly selectedSensorId = signal<string>('');
  protected readonly alerts = signal<DashboardAlert[]>([]);
  protected readonly alertsStatus = signal('Cargando alertas...');
  protected readonly sensorStatus = signal('Cargando sensores asociados...');
  protected readonly metrics = computed(() =>
    [this.humidityMetric(), this.nodeMetric(), this.alertMetric()].filter((metric): metric is DashboardMetric => Boolean(metric))
  );

  private readonly humidityMetric = signal<DashboardMetric | null>(null);
  private readonly nodeMetric = signal<DashboardMetric | null>(null);
  private readonly alertMetric = signal<DashboardMetric | null>(null);
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly api: AdminApiService,
    private readonly auth: AuthService
  ) {
    this.loadDashboardData();
    this.loadActuator();
    this.refreshTimer = setInterval(() => this.refreshSelectedSensorData(), 6000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

  protected onSensorChange(sensorId: string): void {
    this.selectedSensorId.set(sensorId);
    this.refreshSelectedSensorData();
  }

  protected sensorLabel(sensor: AdminPayload): string {
    const parts = [sensor['nombre'], sensor['finca_nombre'], sensor['parcela_nombre'], sensor['codigo_nodo'] ?? sensor['nodo']]
      .filter((value) => value !== undefined && value !== null && value !== '')
      .map((value) => String(value));
    return parts.join(' - ') || `Sensor ${sensor['id']}`;
  }

  protected sendIrrigationCommand(command: IrrigationState): void {
    const actuatorId = this.actuatorId();

    if (!actuatorId) {
      this.commandStatus.set('No hay actuadores disponibles para este usuario.');
      return;
    }

    const request = command === 'Encendido'
      ? this.api.activarRiegoManual(actuatorId)
      : command === 'Apagado'
        ? this.api.desactivarRiegoManual(actuatorId)
        : this.api.activarRiegoAutomatico(actuatorId);

    this.irrigationState.set(command);
    this.commandStatus.set('Enviando comando al backend...');

    request.subscribe({
      next: () => this.commandStatus.set(`Comando ${command.toLowerCase()} enviado al ESP32`),
      error: () => this.commandStatus.set('No fue posible enviar el comando al backend.')
    });
  }

  protected metricClass(status: string): string {
    return `metric metric-${status}`;
  }

  protected severityClass(severity: string): string {
    return `tag tag-${severity.toLowerCase()}`;
  }

  private loadDashboardData(): void {
    const sensorEntity = this.entity('sensor');
    if (!sensorEntity) {
      this.sensorsLoaded.set(true);
      return;
    }

    this.api.getAll(sensorEntity).subscribe({
      next: (sensors) => {
        const soilSensors = sensors.filter((sensor) => sensor['tipo_sensor'] === 'HUMEDAD_SUELO');
        this.soilSensors.set(soilSensors);
        this.hasSoilSensor.set(soilSensors.length > 0);
        this.sensorsLoaded.set(true);

        if (soilSensors.length === 0) {
          this.sensorStatus.set('No tienes sensores de humedad de suelo asociados.');
          this.humidityMetric.set(null);
          this.nodeMetric.set(null);
          this.alertMetric.set(null);
          this.alerts.set([]);
          this.alertsStatus.set('Las alertas se muestran cuando existe un sensor asociado.');
          return;
        }

        if (!this.selectedSensorId()) {
          this.selectedSensorId.set(String(soilSensors[0]['id']));
        }

        this.sensorStatus.set(this.auth.hasAdministrativeRole
          ? 'Selecciona el sensor de la finca que quieres monitorear.'
          : 'Mostrando sensores de humedad asociados a tu usuario.');
        this.loadNodeMetric();
        this.refreshSelectedSensorData();
        this.loadAlerts();
      },
      error: () => {
        this.sensorsLoaded.set(true);
        this.hasSoilSensor.set(false);
        this.sensorStatus.set('No fue posible consultar sensores asociados.');
        this.humidityMetric.set(null);
      }
    });
  }

  private refreshSelectedSensorData(): void {
    if (!this.hasSoilSensor() || !this.selectedSensorId()) {
      return;
    }
    this.loadLatestReading(this.selectedSensorId());
    this.loadAlerts();
  }

  private loadLatestReading(sensorId: string): void {
    const lecturaEntity = this.entity('lectura_sensor');
    if (!lecturaEntity) {
      return;
    }

    this.api.getAll(lecturaEntity).subscribe({
      next: (lecturas) => {
        const readings = lecturas
          .filter((lectura) => String(lectura['sensor']) === sensorId)
          .filter((lectura) => this.isMqttReading(lectura))
          .sort((a, b) => this.timestamp(b) - this.timestamp(a));
        const latest = readings[0];
        const sensor = this.soilSensors().find((item) => String(item['id']) === sensorId);

        if (!latest) {
          this.humidityMetric.set({
            label: 'Humedad suelo',
            value: 'Esperando ESP32',
            detail: `${sensor?.['nombre'] ?? 'Sensor seleccionado'} aun no reporta lecturas MQTT`,
            status: 'warn'
          });
          return;
        }

        this.humidityMetric.set({
          label: 'Humedad suelo',
          value: `${latest['valor'] ?? '--'}${latest['unidad_medida'] ?? '%'}`,
          detail: `${sensor?.['nombre'] ?? 'Sensor de humedad'} - ${this.formatDate(latest['fecha_hora'] ?? latest['id'])}`,
          status: this.humidityStatus(latest['valor'])
        });
      },
      error: () => {
        this.humidityMetric.set({
          label: 'Humedad suelo',
          value: 'Sin lectura',
          detail: 'No fue posible consultar lecturas del sensor',
          status: 'warn'
        });
      }
    });
  }

  private loadNodeMetric(): void {
    const nodoEntity = this.entity('nodo_iot');
    if (!nodoEntity) {
      return;
    }

    this.api.getAll(nodoEntity).subscribe({
      next: (nodos) => {
        const active = nodos.filter((nodo) => nodo['estado'] === 'ACTIVO').length;
        const total = nodos.length;
        this.nodeMetric.set({
          label: 'Nodos asociados',
          value: `${active}/${total}`,
          detail: total > 0 ? 'Nodos IoT visibles para este usuario' : 'No hay nodos asociados',
          status: total > 0 && active === 0 ? 'warn' : 'ok'
        });
      }
    });
  }

  private loadAlerts(): void {
    if (!this.auth.hasAdministrativeRole) {
      return;
    }

    const alertaEntity = this.entity('alerta_sistema');
    if (!alertaEntity) {
      return;
    }

    this.api.getAll(alertaEntity).subscribe({
      next: (alertas) => {
        const abiertas = alertas
          .filter((alerta) => String(alerta['estado'] ?? '').toUpperCase() === 'ABIERTA')
          .sort((a, b) => this.timestamp(b) - this.timestamp(a));

        this.alerts.set(abiertas.slice(0, 5).map((alerta) => ({
          type: String(alerta['tipo_alerta'] ?? 'Alerta'),
          severity: String(alerta['severidad'] ?? 'MEDIA'),
          source: this.alertSource(alerta),
          message: String(alerta['mensaje'] ?? 'Sin mensaje registrado'),
          time: this.formatDate(alerta['fecha_creacion'] ?? alerta['created_at'] ?? alerta['id'])
        })));
        this.alertsStatus.set(abiertas.length > 0 ? '' : 'No hay alertas abiertas.');
        this.alertMetric.set({
          label: 'Alertas abiertas',
          value: String(abiertas.length),
          detail: `${abiertas.filter((alerta) => ['ALTA', 'CRITICA'].includes(String(alerta['severidad']).toUpperCase())).length} de prioridad alta o critica`,
          status: abiertas.length > 0 ? 'danger' : 'ok'
        });
      },
      error: () => {
        this.alerts.set([]);
        this.alertsStatus.set('No fue posible consultar alertas del sistema.');
      }
    });
  }

  private loadActuator(): void {
    const actuadorEntity = this.entity('actuador');
    if (!actuadorEntity) {
      return;
    }

    this.api.getAll(actuadorEntity).subscribe({
      next: (actuadores) => {
        const actuador = actuadores[0] as AdminPayload | undefined;
        const id = Number(actuador?.['id'] ?? 0);
        this.actuatorId.set(id > 0 ? id : null);
        if (!id) {
          this.commandStatus.set('No hay actuadores disponibles para este usuario.');
        }
      },
      error: () => this.actuatorId.set(null)
    });
  }

  private entity(key: string): AdminEntity | undefined {
    return ADMIN_ENTITIES.find((entity) => entity.key === key);
  }

  private timestamp(row: AdminPayload): number {
    const value = row['fecha_hora'] ?? row['fecha_hora_lectura'] ?? row['fecha_creacion'] ?? row['created_at'] ?? row['id'];
    if (typeof value === 'number') {
      return value;
    }
    const date = Date.parse(String(value ?? ''));
    return Number.isNaN(date) ? 0 : date;
  }

  private isMqttReading(row: AdminPayload): boolean {
    return String(row['observacion'] ?? '').toLowerCase().includes('mqtt');
  }

  private humidityStatus(value: AdminPayload[string]): DashboardMetric['status'] {
    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) {
      return 'warn';
    }
    if (numberValue <= 30) {
      return 'danger';
    }
    if (numberValue >= 70) {
      return 'ok';
    }
    return 'warn';
  }

  private alertSource(alerta: AdminPayload): string {
    if (alerta['sensor']) {
      return `Sensor ${alerta['sensor']}`;
    }
    if (alerta['nodo']) {
      return `Nodo ${alerta['nodo']}`;
    }
    if (alerta['actuador']) {
      return `Actuador ${alerta['actuador']}`;
    }
    return 'Sistema';
  }

  private formatDate(value: AdminPayload[string]): string {
    if (!value || typeof value === 'number') {
      return 'Reciente';
    }
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) {
      return 'Reciente';
    }
    return date.toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
