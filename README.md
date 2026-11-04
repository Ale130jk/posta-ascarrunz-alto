# Posta Médica Ascarrunz Alto

Demo frontend de un sistema de citas para una posta médica en San Juan de Lurigancho, Lima. Incluye página pública, portal de pacientes y panel de administración.

## Stack

- React 19 + TypeScript + Vite 8
- Tailwind CSS 4
- React Router 7
- FullCalendar 7 (tema Forma)
- date-fns
- Vitest + cobertura V8
- Datos de demostración en `localStorage`

## Ejecutar

```bash
npm install
npm run dev
```

Disponible en `http://localhost:5173`.

```bash
npm run build
npm run preview
npm run lint
npm test
npm run test:coverage
```

## Accesos demo

| Rol | Acceso |
| --- | --- |
| Paciente | `maria.fernandez@example.com` |
| Administración | `admin@postaascarrunz.pe` / `Ascarrunz2026` |

El acceso de pacientes es solo con correo. La autenticación es demostrativa y no representa un sistema de seguridad real.

## Dossier técnico

La ruta `/tech` resume arquitectura, decisiones, pruebas, accesibilidad y rendimiento con métricas reales de la visita.

Para reiniciar los datos de la demo, borra `posta-ascarrunz:data:v1` y `posta-ascarrunz:session:v1` desde `localStorage` y recarga la página.

No hay backend, API ni base de datos. Los datos viven en el navegador de cada visitante.
