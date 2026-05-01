import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ADMIN_ENTITIES, AdminEntity } from '../../../models/admin.models';

interface AsideGroup {
  label: string;
  items: AdminEntity[];
}

const APP_LABELS: Record<AdminEntity['app'], string> = {
  usuarios: 'Usuarios',
  ubicaciones: 'Ubicaciones',
  iot: 'IoT',
  riego: 'Riego',
  sistema: 'Sistema'
};

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './aside.html',
  styleUrl: './aside.css'
})
export class Aside {
  protected readonly groups: AsideGroup[] = Object.entries(
    ADMIN_ENTITIES.reduce<Record<string, AdminEntity[]>>((groups, entity) => {
      groups[entity.app] = [...(groups[entity.app] ?? []), entity];
      return groups;
    }, {})
  ).map(([app, items]) => ({
    label: APP_LABELS[app as AdminEntity['app']],
    items
  }));
}
