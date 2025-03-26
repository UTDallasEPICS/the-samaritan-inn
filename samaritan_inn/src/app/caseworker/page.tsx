// page.tsx
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Card,
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  TextField,
  IconButton,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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

export default function CaseWorkerDashboard() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [openAnnouncementDialog, setOpenAnnouncementDialog] = useState(false);
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [isAdmin] = useState(true); // Replace with actual admin check

  // Styles
  const styles = {
    container: {
      py: 4,
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
    },
    header: {
      color: '#1976d2',
      mb: 4,
    },
    card: {
      mb: 2,
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    addButton: {
      backgroundColor: '#1976d2',
      color: 'white',
      '&:hover': {
        backgroundColor: '#1565c0',
      },
    },
  };

  // Mock data - Replace with actual API calls
  useEffect(() => {
    // Fetch announcements and events from your API
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

  const handleAddAnnouncement = () => {
    setOpenAnnouncementDialog(true);
  };

  const handleAddEvent = () => {
    setOpenEventDialog(true);
  };

  return (
    <Container maxWidth="lg" sx={styles.container}>
      <Typography variant="h4" component="h1" sx={styles.header}>
        Case Worker Dashboard
      </Typography>

      {/* Announcements Section */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" color="#1976d2">
            Announcements
          </Typography>
          {isAdmin && (
            <Button
              startIcon={<AddIcon />}
              sx={styles.addButton}
              onClick={handleAddAnnouncement}
            >
              Add Announcement
            </Button>
          )}
        </Box>

        {announcements.map((announcement) => (
          <Card key={announcement.id} sx={styles.card}>
            <Box p={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{announcement.title}</Typography>
                {isAdmin && (
                  <Box>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
              <Typography color="text.secondary" gutterBottom>
                {format(new Date(announcement.date), 'MMM dd, yyyy')}
              </Typography>
              <Typography>{announcement.content}</Typography>
            </Box>
          </Card>
        ))}
      </Box>

      {/* Events Section */}
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" color="#1976d2">
            Upcoming Events
          </Typography>
          {isAdmin && (
            <Button
              startIcon={<AddIcon />}
              sx={styles.addButton}
              onClick={handleAddEvent}
            >
              Add Event
            </Button>
          )}
        </Box>

        {events.map((event) => (
          <Card key={event.id} sx={styles.card}>
            <Box p={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{event.title}</Typography>
                {isAdmin && (
                  <Box>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small">
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
        ))}
      </Box>

      {/* Add Announcement Dialog */}
      <Dialog
        open={openAnnouncementDialog}
        onClose={() => setOpenAnnouncementDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {/* Add your announcement form here */}
      </Dialog>

      {/* Add Event Dialog */}
      <Dialog
        open={openEventDialog}
        onClose={() => setOpenEventDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {/* Add your event form here */}
      </Dialog>
    </Container>
  );
}
