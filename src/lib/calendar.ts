import dayGridPlugin from '@fullcalendar/react/daygrid'
import timeGridPlugin from '@fullcalendar/react/timegrid'
import interactionPlugin from '@fullcalendar/react/interaction'
import formaThemePlugin from '@fullcalendar/react/themes/forma'
import esLocale from '@fullcalendar/react/locales/es'

export const calendarPlugins = [
  formaThemePlugin,
  dayGridPlugin,
  timeGridPlugin,
  interactionPlugin,
]
export { esLocale }
