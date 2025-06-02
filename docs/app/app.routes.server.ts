import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'agenda-semanal',
    renderMode: RenderMode.Prerender, // Prerender apenas essa rota
  },
  {
    path: 'agendamentos',
    renderMode: RenderMode.Prerender, // Pre-renderização (se necessário)
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender, // Resto das rotas serão prerenderizadas
  }
];
