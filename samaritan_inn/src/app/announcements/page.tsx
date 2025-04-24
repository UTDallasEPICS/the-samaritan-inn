'use client';

import { useState, useEffect } from 'react';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; content: string; author: string; createdAt: string }[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
  const [isAdmin, setIsAdmin] = useState(true); // Replace with actual admin check logic

  useEffect(() => {
    // Fetch announcements
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/announcements');
        if (!res.ok) throw new Error('Failed to fetch announcements');
        const data = await res.json();
        setAnnouncements(data);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };

    fetchAnnouncements();
  }, []);

  const handlePost = async () => {
    if (!isAdmin) return;

    // Validation: To make sure the annoucement the staff posts is not empty.
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
    alert('Both title and content are required to post an announcement.');
    return;
  }

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAnnouncement, author: 'Admin', isAdmin }),
      });
      if (!res.ok) throw new Error('Failed to post announcement');
      const newPost = await res.json();
      setAnnouncements([newPost, ...announcements]);
      setNewAnnouncement({ title: '', content: '' });
    } catch (error) {
      console.error('Error posting announcement:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Announcements</h1>

      <div className="mb-4">
        {isAdmin && (
          <div className="flex flex-col gap-y-2">
            <input
              type="text"
              placeholder="Title"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              className="border p-2 rounded text-black"
            />
            <textarea
              placeholder="Content"
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
              className="border p-2 rounded text-black"
            />
            <button
              onClick={handlePost}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Post Announcement
            </button>
          </div>
        )}
      </div>

      <ul className="flex flex-col gap-y-4">
        {announcements.map((announcement) => (
          <li key={announcement.id} className="border p-4 rounded">
            <h2 className="font-bold">{announcement.title}</h2>
            <p>{announcement.content}</p>
            <small className="text-gray-500">
              Posted by {announcement.author} on {new Date(announcement.createdAt).toLocaleString()}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Announcements;