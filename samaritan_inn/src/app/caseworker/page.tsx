'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  Card,
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SelectChangeEvent,
  TextField,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Styles
const STYLES = {
  container: {
    py: 4,
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  header: {
    color: '#0caebb',
    mb: 4,
  },
  card: {
    mb: 2,
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  addButton: {
    backgroundColor: '#0caebb',
    color: 'white',
    '&:hover': {
      backgroundColor: '#29abe2',
    },
  },
  navbar: {
    backgroundColor: '#00167c',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '16px 0',
  },
  navContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navBrand: {
    fontWeight: 'bold',
    fontSize: '1.25rem',
    color: 'white',
    textDecoration: 'none',
  },
  navLinkContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  navLink: {
    padding: '8px 16px',
    borderRadius: '4px',
    color: 'white',
    textDecoration: 'none',
    transition: 'background-color 0.3s',
    '&:hover': {
      backgroundColor: '#29abe2',
    },
  },
  activeNavLink: {
    backgroundColor: '#0caebb',
    '&:hover': {
      backgroundColor: '#29abe2',
    },
  },
  userButton: {
    backgroundColor: 'white',
    color: '#00167c',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      backgroundColor: '#f0f0f0',
    },
  },
} as const;

// Theme configuration
const theme = createTheme({
  typography: {
    fontFamily: 'Montserrat',
  },
  palette: {
    primary: {
      main: '#0caebb',
    },
    secondary: {
      main: '#00167c',
    },
    text: {
      primary: '#231f20',
      secondary: '#c7c8ca',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
});

// Interfaces
interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
}

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
}

interface AnnouncementFormData {
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
}

interface EventFormData {
  title: string;
  date: string;
  location: string;
  description: string;
}

// Dialog Props Interfaces
interface AnnouncementDialogProps {
  open: boolean;
  onClose: () => void;
  announcement?: Announcement | null;
  onSubmit: (data: AnnouncementFormData) => void;
}

interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  event?: Event | null;
  onSubmit: (data: EventFormData) => void;
}

// Navigation Bar Component
const NavigationBar = memo(() => (
  <Box sx={STYLES.navbar}>
    <Container maxWidth="lg" sx={STYLES.navContainer}>
      <Box sx={STYLES.navLinkContainer}>
        <Typography component={Link} href="/homepage" sx={STYLES.navBrand}>
          The Samaritan Inn
        </Typography>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
          <Typography 
            component={Link} 
            href="/homepage"
            sx={STYLES.navLink}
          >
            Home
          </Typography>
          <Typography 
            component={Link} 
            href="/curfew"
            sx={STYLES.navLink}
          >
            Pass Request
          </Typography>
          <Typography 
            component={Link} 
            href="/caseworker"
            sx={{...STYLES.navLink, ...STYLES.activeNavLink}}
          >
            Case Worker
          </Typography>
        </Box>
      </Box>
      <Box>
        <Typography 
          component={Link} 
          href="/login"
          sx={STYLES.userButton}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </Typography>
      </Box>
    </Container>
  </Box>
));

// Card Components
const AnnouncementCard = memo(({ announcement, isAdmin, onEdit, onDelete }: {
  announcement: Announcement;
  isAdmin: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) => (
  <Card sx={STYLES.card}>
    <Box p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">{announcement.title}</Typography>
        {isAdmin && (
          <Box>
            <IconButton size="small" onClick={() => onEdit(announcement.id)}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(announcement.id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      </Box>
      <Typography color="text.secondary" gutterBottom>
        {format(new Date(announcement.date), 'MMM dd, yyyy')}
      </Typography>
      <Typography>{announcement.content}</Typography>
      <Typography variant="caption" color={`${announcement.priority}.main`}>
        Priority: {announcement.priority}
      </Typography>
    </Box>
  </Card>
));

const EventCard = memo(({ event, isAdmin, onEdit, onDelete }: {
  event: Event;
  isAdmin: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) => (
  <Card sx={STYLES.card}>
    <Box p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">{event.title}</Typography>
        {isAdmin && (
          <Box>
            <IconButton size="small" onClick={() => onEdit(event.id)}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(event.id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      </Box>
      <Typography color="text.secondary" gutterBottom>
        {format(new Date(event.date), 'MMM dd, yyyy')} - {event.location}
      </Typography>
      <Typography>{event.description}</Typography>
    </Box>
  </Card>
));

// Dialog Components
const AnnouncementDialog = memo(({ open, onClose, announcement, onSubmit }: AnnouncementDialogProps) => {
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    content: '',
    priority: 'medium',
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
      });
    } else {
      setFormData({
        title: '',
        content: '',
        priority: 'medium',
      });
    }
  }, [announcement]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {announcement ? 'Edit Announcement' : 'New Announcement'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Title"
            type="text"
            fullWidth
            value={formData.title}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="content"
            label="Content"
            multiline
            rows={4}
            fullWidth
            value={formData.content}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              name="priority"
              value={formData.priority}
              label="Priority"
            >
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" sx={STYLES.addButton}>
            {announcement ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
});

const EventDialog = memo(({ open, onClose, event, onSubmit }: EventDialogProps) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    date: '',
    location: '',
    description: '',
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        date: event.date.split('T')[0], // Format date for input
        location: event.location,
        description: event.description,
      });
    } else {
      setFormData({
        title: '',
        date: '',
        location: '',
        description: '',
      });
    }
  }, [event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.location.trim() || !formData.date || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {event ? 'Edit Event' : 'New Event'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Title"
            type="text"
            fullWidth
            value={formData.title}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="date"
            label="Date"
            type="date"
            fullWidth
            value={formData.date}
            onChange={handleChange}
            required
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="location"
            label="Location"
            type="text"
            fullWidth
            value={formData.location}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            multiline
            rows={4}
            fullWidth
            value={formData.description}
            onChange={handleChange}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" sx={STYLES.addButton}>
            {event ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
});

const CaseWorkerDashboard = () => {
  // State
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [openAnnouncementDialog, setOpenAnnouncementDialog] = useState(false);
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAdmin] = useState(true);

  // Announcement Handlers
  const handleAnnouncementDialog = useCallback(() => {
    setSelectedAnnouncement(null);
    setOpenAnnouncementDialog(prev => !prev);
  }, []);

  const handleEditAnnouncement = useCallback((id: string) => {
    const announcement = announcements.find(a => a.id === id);
    if (announcement) {
      setSelectedAnnouncement(announcement);
      setOpenAnnouncementDialog(true);
    }
  }, [announcements]);

  const handleDeleteAnnouncement = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      setAnnouncements(prev => prev.filter(announcement => announcement.id !== id));
    }
  }, []);

  const handleSubmitAnnouncement = useCallback((data: AnnouncementFormData) => {
    if (selectedAnnouncement) {
      setAnnouncements(prev => prev.map(announcement => 
        announcement.id === selectedAnnouncement.id
          ? {
              ...announcement,
              ...data,
              date: new Date().toISOString(),
            }
          : announcement
      ));
    } else {
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        ...data,
        date: new Date().toISOString(),
      };
      setAnnouncements(prev => [...prev, newAnnouncement]);
    }
    setOpenAnnouncementDialog(false);
    setSelectedAnnouncement(null);
  }, [selectedAnnouncement]);

  // Event Handlers
  const handleEventDialog = useCallback(() => {
    setSelectedEvent(null);
    setOpenEventDialog(prev => !prev);
  }, []);

  const handleEditEvent = useCallback((id: string) => {
    const event = events.find(e => e.id === id);
    if (event) {
      setSelectedEvent(event);
      setOpenEventDialog(true);
    }
  }, [events]);

  const handleDeleteEvent = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(prev => prev.filter(event => event.id !== id));
    }
  }, []);

  const handleSubmitEvent = useCallback((data: EventFormData) => {
    if (selectedEvent) {
      setEvents(prev => prev.map(event => 
        event.id === selectedEvent.id
          ? {
              ...event,
              ...data,
            }
          : event
      ));
    } else {
      const newEvent: Event = {
        id: Date.now().toString(),
        ...data,
      };
      setEvents(prev => [...prev, newEvent]);
    }
    setOpenEventDialog(false);
    setSelectedEvent(null);
  }, [selectedEvent]);

  // Load initial data
  useEffect(() => {
    // Mock data - replace with actual API calls
    setAnnouncements([
      {
        id: '1',
        title: 'Important Notice',
        content: 'Staff meeting tomorrow at 9 AM',
        date: new Date().toISOString(),
        priority: 'high',
      },
    ]);

    setEvents([
      {
        id: '1',
        title: 'Community Gathering',
        date: new Date().toISOString(),
        location: 'Main Hall',
        description: 'Monthly community meeting',
      },
    ]);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      {/* Navigation Bar */}
      <NavigationBar />
      
      <Container maxWidth="lg" sx={STYLES.container}>
        <Typography variant="h4" component="h1" sx={STYLES.header}>
          Case Worker Dashboard
        </Typography>

        {/* Announcements Section */}
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" color="primary">
              Announcements
            </Typography>
            {isAdmin && (
              <Button
                startIcon={<AddIcon />}
                sx={STYLES.addButton}
                onClick={handleAnnouncementDialog}
              >
                Add Announcement
              </Button>
            )}
          </Box>

          {announcements.map(announcement => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              isAdmin={isAdmin}
              onEdit={handleEditAnnouncement}
              onDelete={handleDeleteAnnouncement}
            />
          ))}
        </Box>

        {/* Events Section */}
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" color="primary">
              Upcoming Events
            </Typography>
            {isAdmin && (
              <Button
                startIcon={<AddIcon />}
                sx={STYLES.addButton}
                onClick={handleEventDialog}
              >
                Add Event
              </Button>
            )}
          </Box>

          {events.map(event => (
            <EventCard
              key={event.id}
              event={event}
              isAdmin={isAdmin}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
            />
          ))}
        </Box>

        {/* Dialogs */}
        <AnnouncementDialog
          open={openAnnouncementDialog}
          onClose={handleAnnouncementDialog}
          announcement={selectedAnnouncement}
          onSubmit={handleSubmitAnnouncement}
        />

        <EventDialog
          open={openEventDialog}
          onClose={handleEventDialog}
          event={selectedEvent}
          onSubmit={handleSubmitEvent}
        />
      </Container>
    </ThemeProvider>
  );
};

export default memo(CaseWorkerDashboard);