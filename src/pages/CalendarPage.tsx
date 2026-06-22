import { IntranetHeader } from "@/components/IntranetHeader";
import { ArrowLeft, Plus, Clock, MapPin, Users, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { ru } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface CalendarEvent {
  id: number;
  name: string;
  date: string;
  time: string;
  location: string;
  participants?: string;
  color: string;
}

const initialEvents: CalendarEvent[] = [
  { id: 1, name: "Конференция IT-решений", date: "2026-03-15", time: "10:00", location: "Конференц-зал А", color: "bg-primary" },
  { id: 2, name: "Встреча с партнёрами", date: "2026-03-18", time: "14:00", location: "Переговорная 2", color: "bg-accent" },
  { id: 3, name: "Презентация проекта", date: "2026-03-22", time: "11:00", location: "Зал презентаций", color: "bg-primary" },
  { id: 4, name: "Корпоративный тренинг", date: "2026-03-25", time: "09:00", location: "Учебный центр", color: "bg-accent" },
  { id: 5, name: "Планёрка отдела", date: "2026-03-12", time: "10:30", location: "Переговорная 1", color: "bg-primary" },
  { id: 6, name: "Стратегическая сессия", date: "2026-03-28", time: "13:00", location: "Конференц-зал Б", color: "bg-accent" },
  { id: 7, name: "Ежемесячный отчёт", date: "2026-04-01", time: "10:00", location: "Конференц-зал А", color: "bg-primary" },
  { id: 8, name: "Демо-день продуктов", date: "2026-04-10", time: "15:00", location: "Зал презентаций", color: "bg-accent" },
];

const EventCard = ({ event, index }: { event: CalendarEvent; index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.05 * index }}
    className="card-modern p-4 shadow-card flex items-start gap-3 hover:shadow-card-hover transition-shadow"
  >
    <div className={`w-1.5 min-h-[50px] rounded-full ${event.color} shrink-0`} />
    <div className="flex-grow min-w-0">
      <h3 className="text-sm font-bold text-card-foreground truncate">{event.name}</h3>
      <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock size={12} className="text-primary" />
          {new Date(event.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}, {event.time}
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={12} className="text-accent" />
          {event.location}
        </span>
        {event.participants && (
          <span className="flex items-center gap-1">
            <Users size={12} />
            {event.participants.split("\n").length} участн.
          </span>
        )}
      </div>
    </div>
  </motion.div>
);

const CalendarPage = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("10:00");
  const [newLocation, setNewLocation] = useState("");
  const [newParticipants, setNewParticipants] = useState("");

  const selectedDateStr = selectedDate?.toISOString().split("T")[0];
  const filteredEvents = selectedDateStr
    ? events.filter((e) => e.date === selectedDateStr)
    : events;

  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return [...events]
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [events]);

  const eventDates = events.map((e) => new Date(e.date));

  const handleCreateEvent = () => {
    if (!newName.trim() || !newDate) {
      toast({ title: "Ошибка", description: "Заполните название и дату мероприятия", variant: "destructive" });
      return;
    }
    const newEvent: CalendarEvent = {
      id: Date.now(),
      name: newName.trim(),
      date: newDate,
      time: newTime,
      location: newLocation.trim(),
      participants: newParticipants.trim(),
      color: events.length % 2 === 0 ? "bg-primary" : "bg-accent",
    };
    setEvents((prev) => [...prev, newEvent]);
    setNewName("");
    setNewDate("");
    setNewTime("10:00");
    setNewLocation("");
    setNewParticipants("");
    setDialogOpen(false);
    toast({ title: "Мероприятие создано", description: newEvent.name });
  };

  return (
    <div className="min-h-screen bg-background mesh-bg">
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ArrowLeft size={18} className="text-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Корпоративный календарь</h1>
              <p className="text-sm text-muted-foreground">Мероприятия и события компании</p>
            </div>
          </div>

          {(role === "admin" || role === "marketer") && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 rounded-xl">
                  <Plus size={16} />
                  Создать мероприятие
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Новое мероприятие</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label>Наименование мероприятия</Label>
                    <Input placeholder="Например: Стратегическая сессия" value={newName} onChange={(e) => setNewName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Дата</Label>
                      <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                    </div>
                    <div>
                      <Label>Время</Label>
                      <Input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label>Локация / Адрес</Label>
                    <Input placeholder="Например: Конференц-зал А" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} />
                  </div>
                  <div>
                    <Label>Список участников</Label>
                    <Textarea placeholder="Укажите участников, каждый с новой строки" value={newParticipants} onChange={(e) => setNewParticipants(e.target.value)} rows={3} />
                  </div>
                  <Button onClick={handleCreateEvent} className="w-full rounded-xl">Создать</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar + All events sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="neu-card p-0 overflow-hidden">
              <div className="welcome-gradient relative px-6 py-5 text-white overflow-hidden">
                <div className="absolute -top-10 -right-8 w-36 h-36 rounded-full bg-neptune/40 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-10 w-40 h-40 rounded-full bg-amber/25 blur-3xl pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "16px 16px" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center">
                      <CalendarDays size={18} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white leading-tight">Календарь</h2>
                      <p className="text-[11px] text-white/70 leading-tight">События и встречи</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-white/60">Сегодня</p>
                    <p className="text-sm font-bold text-white">
                      {new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={ru}
                  modifiers={{ event: eventDates }}
                  modifiersClassNames={{
                    event:
                      "relative !text-titan font-bold bg-neptune/10 after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-neptune",
                  }}
                  className="w-full pointer-events-auto"
                  classNames={{
                    months: "w-full",
                    month: "w-full space-y-3",
                    caption: "flex justify-center pt-1 relative items-center mb-2",
                    caption_label: "text-sm font-bold text-titan capitalize",
                    nav_button:
                      "h-8 w-8 rounded-xl bg-mist neu-icon hover:text-neptune transition-colors",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse",
                    head_row: "flex w-full border-b border-border/50 pb-1 mb-1",
                    head_cell:
                      "flex-1 text-center text-[0.7rem] font-bold uppercase tracking-wider text-titan py-1.5",
                    row: "flex w-full mt-1",
                    cell: "flex-1 text-center text-sm p-0.5 relative",
                    day: "h-10 w-full rounded-xl font-medium text-graphite hover:bg-cloud hover:text-titan hover:scale-105 transition-all",
                    day_selected:
                      "!bg-sky !text-white shadow-glow-sky scale-105 hover:!bg-sky hover:!text-white",
                    day_today:
                      "bg-amber/15 ring-2 ring-amber/70 text-amber font-bold",
                    day_outside: "text-muted-foreground/40",
                  }}
                />

                {/* Legend */}
                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-neptune" /> Событие
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md ring-2 ring-amber/70" /> Сегодня
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-sky shadow-glow-sky" /> Выбрано
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDate(undefined)}
                className="w-full py-3 text-sm font-semibold text-sky border-t border-border hover:bg-cloud hover:text-titan transition-colors"
              >
                Показать все события
              </button>
            </div>

            {/* Upcoming events */}
            <div className="card-modern p-5 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays size={18} className="text-primary" />
                <h2 className="text-base font-bold text-foreground">Ближайшие события</h2>
              </div>
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Нет запланированных событий</p>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {upcomingEvents.map((event, i) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-default"
                    >
                      <div className={`w-1 h-8 rounded-full ${event.color} shrink-0`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-card-foreground truncate">{event.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}, {event.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Filtered events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {selectedDate
                  ? `События на ${selectedDate.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}`
                  : "Все события"}
              </h2>
              <span className="text-xs font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {filteredEvents.length} {filteredEvents.length === 1 ? "событие" : "событий"}
              </span>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="card-modern p-10 shadow-card text-center">
                <p className="text-muted-foreground">Нет событий на выбранную дату</p>
              </div>
            ) : (
              filteredEvents.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
