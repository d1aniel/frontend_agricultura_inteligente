import { Component, computed, signal } from '@angular/core';
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
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
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
  protected readonly metrics = signal<DashboardMetric[]>([]);
  protected readonly alerts = signal<DashboardAlert[]>([]);
  protected readonly alertsStatus = signal('Cargando alertas...');
  protected readonly sensorStatus = signal('Cargando sensores asociados...');

  constructor(
    private readonly api: AdminApiService,
    private readonly auth: AuthService
  ) {
    this.loadDashboardData();
    this.loadActuator();
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
        this.hasSoilSensor.set(soilSensors.length > 0);
        this.sensorsLoaded.set(true);

        if (soilSensors.length === 0) {
          this.sensorStatus.set('No tienes sensores de humedad de suelo asociados.');
          this.metrics.set([]);
          this.alerts.set([]);
          this.alertsStatus.set('Las alertas se muestran cuando existe un sensor asociado.');
          return;
        }

        this.sensorStatus.set('Sensor de humedad de suelo asociado.');
        this.loadMetrics(soilSensors);
        this.loadAlerts();
      },
      error: () => {
        this.sensorsLoaded.set(true);
        this.hasSoilSensor.set(false);
        this.sensorStatus.set('No fue posible consultar sensores asociados.');
        this.metrics.set([]);
      }
    });
  }

  private loadMetrics(soilSensors: AdminPayload[]): void {
    const lecturaEntity = this.entity('lectura_sensor');
    const nodoEntity = this.entity('nodo_iot');
    if (!lecturaEntity) {
      return;
    }

    this.api.getAll(lecturaEntity).subscribe({
      next: (lecturas) => {
        const soilSensorIds = new Set(soilSensors.map((sensor) => String(sensor['id'])));
        const soilReadings = lecturas
          .filter((lectura) => soilSensorIds.has(String(lectura['sensor'])))
          .sort((a, b) => this.timestamp(b) - this.timestamp(a));
        const latest = soilReadings[0];

        if (!latest) {
          this.metrics.set([
            {
              label: 'Humedad suelo',
              value: 'Sin lectura',
              detail: 'El sensor asociado aun no reporta datos',
              status: 'warn'
            }
          ]);
          return;
        }

        const sensor = soilSensors.find((item) => String(item['id']) === String(latest['sensor']));
        this.metrics.set([
          {
            label: 'Humedad suelo',
            value: `${latest['valor'] ?? '--'}${latest['unidad_medida'] ?? '%'}`,
            detail: `${sensor?.['nombre'] ?? 'Sensor de humedad'} - ${latest['calidad_dato'] ?? 'lectura registrada'}`,
            status: this.humidityStatus(latest['valor'])
          }
        ]);
      },
      error: () => {
        this.metrics.set([
          {
            label: 'Humedad suelo',
            value: 'Sin lectura',
            detail: 'No fue posible consultar lecturas del sensor',
            status: 'warn'
          }
        ]);
      }
    });

    if (nodoEntity) {
      this.api.getAll(nodoEntity).subscribe({
        next: (nodos) => {
          const active = nodos.filter((nodo) => nodo['estado'] === 'ACTIVO').length;
          const total = nodos.length;
          this.metrics.update((current) => [
            ...current,
            {
              label: 'Nodos asociados',
              value: `${active}/${total}`,
              detail: total > 0 ? 'Nodos IoT visibles para este usuario' : 'No hay nodos asociados',
              status: total > 0 && active === 0 ? 'warn' : 'ok'
            }
          ]);
        }
      });
    }
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
        this.metrics.update((current) => [
          ...current,
          {
            label: 'Alertas abiertas',
            value: String(abiertas.length),
            detail: `${abiertas.filter((alerta) => ['ALTA', 'CRITICA'].includes(String(alerta['severidad']).toUpperCase())).length} de prioridad alta o critica`,
            status: abiertas.length > 0 ? 'danger' : 'ok'
          }
        ]);
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
    const value = row['fecha_hora_lectura'] ?? row['fecha_creacion'] ?? row['created_at'] ?? row['id'];
    if (typeof value === 'number') {
      return value;
    }
    const date = Date.parse(String(value ?? ''));
    return Number.isNaN(date) ? 0 : date;
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
