import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminEntity } from '../models/admin.models';
import { environment } from '../../environments/environment';

export type AdminPayload = Record<string, string | number | boolean | null>;

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  constructor(private readonly http: HttpClient) {}

  getAll(entity: AdminEntity): Observable<AdminPayload[]> {
    return this.http.get<AdminPayload[]>(this.url(entity));
  }

  getById(entity: AdminEntity, id: string | number): Observable<AdminPayload> {
    return this.http.get<AdminPayload>(`${this.url(entity)}${id}/`);
  }

  create(entity: AdminEntity, payload: AdminPayload): Observable<AdminPayload> {
    return this.http.post<AdminPayload>(this.url(entity), payload);
  }

  update(entity: AdminEntity, id: string | number, payload: AdminPayload): Observable<AdminPayload> {
    return this.http.put<AdminPayload>(`${this.url(entity)}${id}/`, payload);
  }

  delete(entity: AdminEntity, id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.url(entity)}${id}/`);
  }

  activarRiegoManual(actuadorId: number): Observable<AdminPayload> {
    return this.http.post<AdminPayload>(`${environment.apiUrl}/api_riego/comandos-riego/activar-manual/`, {
      actuador_id: actuadorId
    });
  }

  desactivarRiegoManual(actuadorId: number): Observable<AdminPayload> {
    return this.http.post<AdminPayload>(`${environment.apiUrl}/api_riego/comandos-riego/desactivar-manual/`, {
      actuador_id: actuadorId
    });
  }

  private url(entity: AdminEntity): string {
    return `${environment.apiUrl}/${entity.apiBasePath}/${entity.endpoint}/`;
  }
}
