import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import isSameMonth from 'date-fns/isSameMonth';
import isToday from 'date-fns/isToday';
import fr from 'date-fns/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { taskService } from '../../services/taskService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const locales = {
  fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const viewModes = [
  { key: 'month', label: 'Mois' },
  { key: 'week', label: 'Semaine' },
  { key: 'day', label: 'Jour' },
  { key: 'agenda', label: 'Agenda' },
];

const CalendarToolbar = ({ label, onNavigate, onView, view }) => (
  <div className="rbc-toolbar mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <span className="rbc-btn-group flex flex-wrap">
      <button type="button" onClick={() => onNavigate('TODAY')}>
        Aujourd'hui
      </button>
      <button type="button" onClick={() => onNavigate('PREV')}>
        Precedent
      </button>
      <button type="button" onClick={() => onNavigate('NEXT')}>
        Suivant
      </button>
    </span>

    <span className="rbc-toolbar-label text-xl font-extrabold text-gray-900 dark:text-gray-100">
      {label}
    </span>

    <span className="rbc-btn-group flex flex-wrap">
      {viewModes.map((mode) => (
        <button
          key={mode.key}
          type="button"
          className={view === mode.key ? 'rbc-active' : ''}
          onClick={() => onView(mode.key)}
        >
          {mode.label}
        </button>
      ))}
    </span>
  </div>
);

export const CalendarView = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState('month');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await taskService.getMyTasks();
        setTasks(response.data || []);
      } catch {
        toast.error('Erreur lors du chargement des taches pour le calendrier');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const events = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    start: new Date(task.due_date || task.created_at),
    end: new Date(task.due_date || task.created_at),
    allDay: true,
    resource: task,
  }));

  const handleSelectEvent = (event) => {
    navigate(`/tasks/${event.id}`);
  };

  const handleSelectSlot = ({ start }) => {
    const selectedDate = new Date(start).toLocaleDateString('fr-FR');
    toast(`Date selectionnee: ${selectedDate}`);
  };

  return (
    <div className="max-w-[68rem] mx-auto mt-4 md:mt-6">
      <div className="bg-white rounded-lg shadow-lg dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 md:p-5 h-[560px] md:h-[620px] overflow-hidden flex flex-col">
        <h1 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Calendrier des taches</h1>
        {loading ? (
          <div className="flex items-center justify-center flex-1 min-h-0">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="task-calendar flex-1 min-h-0 overflow-hidden rounded-md">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              date={date}
              view={view}
              onView={setView}
              onNavigate={setDate}
              views={['month', 'week', 'day', 'agenda']}
              components={{ toolbar: CalendarToolbar }}
              popup
              selectable
              onSelectSlot={handleSelectSlot}
              messages={{
                next: 'Suivant',
                previous: 'Precedent',
                today: "Aujourd'hui",
                month: 'Mois',
                week: 'Semaine',
                day: 'Jour',
                agenda: 'Agenda',
                date: 'Date',
                time: 'Heure',
                event: 'Evenement',
                noEventsInRange: 'Aucun evenement dans cette plage.',
              }}
              culture="fr"
              onSelectEvent={handleSelectEvent}
              dayPropGetter={(dayDate) => {
                const classes = [];
                if (view === 'month' && !isSameMonth(dayDate, date)) {
                  classes.push('calendar-off-month');
                }
                if (isToday(dayDate)) {
                  classes.push('calendar-today');
                }
                return { className: classes.join(' ') };
              }}
              eventPropGetter={(event) => {
                const priorityColor = {
                  low: '#10B981',
                  medium: '#3B82F6',
                  high: '#F59E0B',
                  critical: '#EF4444',
                };
                const backgroundColor = priorityColor[event.resource.priority] || '#3B82F6';
                return {
                  style: {
                    backgroundColor,
                    borderRadius: '6px',
                    opacity: 0.95,
                    color: 'white',
                    border: '0px',
                    display: 'block',
                  },
                };
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
