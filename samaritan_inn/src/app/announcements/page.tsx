'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SidebarCalendar from "@/components/SidebarCalendar";


interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

interface EventItem {
  id: string;
  title: string;
  content: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  author: string;
  createdAt: string;
}

type Section = 'announcements' | 'events';

// Turn an ISO timestamp into a human-readable string
const formatDateTime = (isoStr: string) => {
  const dt = new Date(isoStr);
  return isNaN(dt.getTime())
    ? 'Invalid Date'
    : dt.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

export default function Announcements() {
  // 1) Authentication hooks
  const { data: session, status } = useSession();
  const router = useRouter();

  // 2) State hooks (always at top)
  const [section, setSection] = useState<Section>('announcements');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
  const [events, setEvents] = useState<EventItem[]>([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    content: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>({});
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

const filteredAnnouncements = selectedDate
  ? announcements.filter(a => a.createdAt?.slice(0,10) === selectedDate)
  : announcements;

const filteredEvents = selectedDate
  ? events.filter(e => e.startDate?.slice(0,10) === selectedDate || e.endDate?.slice(0,10) === selectedDate)
  : events;

const filteredItems = section === 'announcements' ? filteredAnnouncements : filteredEvents;


  // 3) Derived values
  const isAdmin = session?.user?.role === 'admin';
  const items = section === 'announcements' ? announcements : events;

  // 4) Redirect unauthenticated users
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/unauthorized');
    }
  }, [status, router]);

  // 5) Load announcements and events
  useEffect(() => {
    fetch('/api/announcements')
      .then(res => res.json())
      .then(setAnnouncements)
      .catch(console.error);
    fetch('/api/events')
      .then(res => res.json())
      .then(setEvents)
      .catch(console.error);
  }, []);

// 5) While session is still loading, render nothing
  if (status === 'loading') {
    return null;
  }

  // 7) Handlers
  const handleModalClose = () => {
    setShowModal(false);
    setEditingId(null);
    setEditingItem({});
    setNewAnnouncement({ title: '', content: '' });
    setNewEvent({
      title: '',
      content: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
    });
  };

  const open = Boolean(anchorEl);
  const handleSectionClick = (e: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(e.currentTarget);
  const handleSectionClose = () => setAnchorEl(null);
  const handleSectionSelect = (sec: Section) => {
    setSection(sec);
    setAnchorEl(null);
  };

  const handlePostItem = async () => {
    if (!isAdmin) return;
    if (section === 'announcements') {
      const { title, content } = newAnnouncement;
      if (!title.trim() || !content.trim()) {
        return alert('Title and content required');
      }
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAnnouncement, author: 'Admin', isAdmin }),
      });
      if (!res.ok) return console.error('Post failed');
      const data = await res.json();
      setAnnouncements(prev => [data, ...prev]);
    } else {
      const {
        title,
        content,
        startDate,
        endDate,
        startTime,
        endTime,
      } = newEvent;
      if (
        !title.trim() ||
        !content.trim() ||
        !startDate ||
        !endDate ||
        !startTime ||
        !endTime
      ) {
        return alert('All fields required');
      }
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });
      if (!res.ok) return console.error('Post failed');
      const data = await res.json();
      setEvents(prev => [data, ...prev]);
    }
    handleModalClose();
  };

  const handleSaveItem = async () => {
    if (!isAdmin || !editingId) return;
    const path =
      section === 'announcements'
        ? `/api/announcements/${editingId}`
        : `/api/events/${editingId}`;
    const res = await fetch(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingItem),
    });
    if (!res.ok) return console.error('Update failed');
    const data = await res.json();
    if (section === 'announcements') {
      setAnnouncements(prev => prev.map(a => (a.id === data.id ? data : a)));
    } else {
      setEvents(prev => prev.map(e => (e.id === data.id ? data : e)));
    }
    handleModalClose();
  };

  const handleDeleteItem = async (id: string) => {
    if (!isAdmin || !confirm('Confirm delete?')) return;
    const path =
      section === 'announcements'
        ? `/api/announcements/${id}`
        : `/api/events/${id}`;
    const res = await fetch(path, { method: 'DELETE' });
    if (!res.ok) return console.error('Delete failed');
    if (section === 'announcements') {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } else {
      setEvents(prev => prev.filter(e => e.id !== id));
    }
  };

  const initEdit = (item: any) => {
    setEditingId(item.id);
    setEditingItem({ ...item });
    setShowModal(true);
  };

  // 8) Render
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-grow flex flex-col items-start bg-gray-100 p-4">
        <div className="w-full max-w-6xl p-6 bg-white shadow-md rounded-md">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            
              <h1 className="text-2xl font-semibold text-black mb-4">Announcements</h1>
              
            
           
            {isAdmin && (
              <Button
                variant="contained"
                onClick={() => setShowModal(true)}
                sx={{
                  backgroundColor: '#29abe2',
                  '&:hover': {
                    backgroundColor: '#1f8fbf',
                  },
                }}
              >
                New {section === 'announcements' ? 'Announcement' : 'Event'}
              </Button>
            )}
          </div>
            </div>
            </div>
          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4 text-black">
                  {editingId
                    ? `Edit ${
                        section === 'announcements' ? 'Announcement' : 'Event'
                      }`
                    : `New ${
                        section === 'announcements' ? 'Announcement' : 'Event'
                      }`}
                </h2>

                {/* Title */}
                <input
                  type="text"
                  placeholder="Title"
                  value={
                    editingId
                      ? editingItem.title
                      : section === 'announcements'
                      ? newAnnouncement.title
                      : newEvent.title
                  }
                  onChange={e => {
                    if (editingId) {
                      setEditingItem({ ...editingItem, title: e.target.value });
                    } else if (section === 'announcements') {
                      setNewAnnouncement({ ...newAnnouncement, title: e.target.value });
                    } else {
                      setNewEvent({ ...newEvent, title: e.target.value });
                    }
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-black placeholder-gray-400"
                />

                {/* Content */}
                <textarea
                  placeholder="Content"
                  value={
                    editingId
                      ? editingItem.content
                      : section === 'announcements'
                      ? newAnnouncement.content
                      : newEvent.content
                  }
                  onChange={e => {
                    if (editingId) {
                      setEditingItem({ ...editingItem, content: e.target.value });
                    } else if (section === 'announcements') {
                      setNewAnnouncement({ ...newAnnouncement, content: e.target.value });
                    } else {
                      setNewEvent({ ...newEvent, content: e.target.value });
                    }
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2 h-24 mb-4 text-black placeholder-gray-400"
                />

                {/* Event-only fields */}
                {section === 'events' && (
                  <>
                    <label className="block mb-1 text-black">Start Date</label>
                    <input
                      type="date"
                      value={editingId ? editingItem.startDate : newEvent.startDate}
                      onChange={e =>
                        editingId
                          ? setEditingItem({ ...editingItem, startDate: e.target.value })
                          : setNewEvent({ ...newEvent, startDate: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-black placeholder-gray-400"
                    />

                    <label className="block mb-1 text-black">End Date</label>
                    <input
                      type="date"
                      value={editingId ? editingItem.endDate : newEvent.endDate}
                      onChange={e =>
                        editingId
                          ? setEditingItem({ ...editingItem, endDate: e.target.value })
                          : setNewEvent({ ...newEvent, endDate: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-black placeholder-gray-400"
                    />

                    <label className="block mb-1 text-black">Start Time</label>
                    <input
                      type="time"
                      value={editingId ? editingItem.startTime : newEvent.startTime}
                      onChange={e =>
                        editingId
                          ? setEditingItem({ ...editingItem, startTime: e.target.value })
                          : setNewEvent({ ...newEvent, startTime: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-black placeholder-gray-400"
                    />

                    <label className="block mb-1 text-black">End Time</label>
                    <input
                      type="time"
                      value={editingId ? editingItem.endTime : newEvent.endTime}
                      onChange={e =>
                        editingId
                          ? setEditingItem({ ...editingItem, endTime: e.target.value })
                          : setNewEvent({ ...newEvent, endTime: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-black placeholder-gray-400"
                    />
                  </>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-2">
                  <Button
                    onClick={editingId ? handleSaveItem : handlePostItem}
                    variant="contained"
                    color="primary"
                  >
                    {editingId ? 'Save' : 'Post'}
                  </Button>
                  <Button onClick={handleModalClose} variant="outlined">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Unified List */}
          <ul className="flex flex-col gap-y-4">
            {items.map(item => {
              const isEvent = section === 'events';
              return (
                <li
                  key={item.id}
                  className="border border-gray-300 p-4 rounded-md bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-semibold text-black">
                      {item.title}
                    </h2>
                    {isAdmin && (
                      <div className="flex space-x-1">
                        <IconButton size="small" onClick={() => initEdit(item)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </div>
                    )}
                  </div>

                  <p className="text-black mt-2">{item.content}</p>

                  {isEvent && (
                    <small className="text-gray-500 block mt-2">
                      {formatDateTime((item as EventItem).startTime)} – {formatDateTime((item as EventItem).endTime)}
                    </small>
                  )}

                  <small className="text-gray-500 block mt-2">
                    Posted by {item.author} on{' '}
                    {new Date(item.createdAt).toLocaleString()}
                  </small>
                </li>
              );
            })}
          </ul>
        </div>
              {/* RIGHT: Sidebar Calendar */}
    <aside className="lg:col-span-1">
      <SidebarCalendar
        className="w-full"
        announcements={announcements.map(a => ({
          id: a.id,
          title: a.title,
          content: a.content,
          date: a.createdAt?.slice(0, 10), // <- what SidebarCalendar expects
        }))}
        onDateSelect={(isoDate: string) => setSelectedDate(isoDate)}
      />
    </aside>

      </div>
    </div>
  );
}
