import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ADMIN_ENTITIES } from '../../models/admin.models';
import { AdminApiService } from '../../services/admin-api.service';
import { AuthService } from '../../services/auth.service';

type IrrigationState = 'Encendido' | 'Apagado';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  protected readonly entities = computed(() =>
    ADMIN_ENTITIES.filter((entity) =>
      entity.hideFromNavigation !== true && (!entity.requiresAdministrativeRole || this.auth.hasAdministrativeRole)
    )
  );
  protected readonly irrigationState = signal<IrrigationState>('Apagado');
  protected readonly commandStatus = signal('Sin comandos pendientes');

  protected readonly metrics = [
    { label: 'Humedad suelo', value: '42%', detail: 'Parcela Norte - lectura valida', status: 'ok' },
    { label: 'Temperatura', value: '27 C', detail: 'DHT11 Nodo ESP32-01', status: 'info' },
    { label: 'Nodos activos', value: '8/10', detail: '2 con conexion intermitente', status: 'warn' },
    { label: 'Alertas abiertas', value: '3', detail: '1 requiere atencion alta', status: 'danger' }
  ];

  protected readonly alerts = [
    { type: 'Humedad baja', severity: 'Alta', source: 'Sensor suelo PAR-04', message: 'Humedad por debajo del umbral de 15%', time: '10:18' },
    { type: 'Nodo desconectado', severity: 'Media', source: 'ESP32-03', message: 'No reporta lecturas desde hace 24 minutos', time: '09:52' },
    { type: 'Falla rele', severity: 'Critica', source: 'ACT-RELE-02', message: 'Respuesta de comando con codigo de error', time: 'Ayer 17:40' }
  ];

  constructor(
    private readonly api: AdminApiService,
    private readonly auth: AuthService
  ) {}

  protected sendIrrigationCommand(command: IrrigationState): void {
    const request = command === 'Encendido' ? this.api.activarRiegoManual(1) : this.api.desactivarRiegoManual(1);

    this.irrigationState.set(command);
    this.commandStatus.set('Enviando comando al backend...');

    request.subscribe({
      next: () => this.commandStatus.set(`Comando manual ${command.toLowerCase()} ejecutado`),
      error: () => this.commandStatus.set(`Endpoint listo: /api_riego/comandos-riego/${command === 'Encendido' ? 'activar' : 'desactivar'}-manual/`)
    });
  }

  protected metricClass(status: string): string {
    return `metric metric-${status}`;
  }
}
