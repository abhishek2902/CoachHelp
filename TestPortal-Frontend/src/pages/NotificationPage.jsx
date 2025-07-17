import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { LoaderCircle } from 'lucide-react';
import { handleUnauthorized } from '../utils/handleUnauthorized.js';
import Swal from 'sweetalert2';
import { useLayoutEffect } from 'react';
import { useApiLoading } from '../hooks/useApiLoading';

const NotificationCard = ({ notification, isLast, onLastCardRef, onClear }) => {
  const handleClear = () => {
    onClear(notification.id);

    Swal.fire({
      title: 'Cleared!',
      text: 'Notification cleared successfully.',
      icon: 'success',
      timer: 1000,
      showConfirmButton: false,
    });
  };

  return (
    <div
      ref={isLast ? onLastCardRef : null}
      className="p-4 relative rounded-lg shadow-lg bg-white dark:border-gray-600 dark:bg-white bg-gradient-to-r from-gray-50 via-white to-gray-100"
      role="alert"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-800">
          {notification.title || 'Notification'}
        </h3>
        <button
          onClick={handleClear}
          className="ml-2 px-3 py-1 text-sm bg-gray-500 text-white hover:bg-gray-500 rounded-md transition"
        >
          Clear
        </button>
      </div>
      <div className="mt-2 text-sm text-gray-700 dark:text-gray-700">
        {notification.message || 'No message content.'}
      </div>
    </div>
  );
};

const NotificationPage = ({ activeTab, setunreadnotification }) => {
  const [notifications, setNotifications] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef('');
  const scrollContainerRef = useRef(null);
  // Track if we need to restore
  const [shouldRestoreScroll, setShouldRestoreScroll] = useState(false);
  const scrollTopRef = useRef(0);
  const { startLoading, stopLoading, isLoading } = useApiLoading();

  useLayoutEffect(() => {
    if (shouldRestoreScroll && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollTopRef.current;
      setShouldRestoreScroll(false);
    }
  }, [filteredList]);

  const lastNotificationRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore, page]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (
        el.scrollHeight - el.scrollTop <= el.clientHeight + 100 &&
        hasMore &&
        !loading
      ) {
        setPage(prev => prev + 1);
      }
    };

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading]);


  useEffect(() => {
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_BASE_URL;

    const markAsRead = async () => {
      startLoading();
      try {
        await axios.put(`${base}/notifications/mark_as_read`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setunreadnotification(0);
      } catch (error) {
        console.error('Error marking notifications as read:', error);
        if (error.response?.status === 401) handleUnauthorized();
      } finally {
        stopLoading();
      }
    };

    markAsRead();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_BASE_URL;
    setLoading(true);
    const prevScrollTop = scrollContainerRef.current?.scrollTop;

    if (scrollContainerRef.current) {
      scrollTopRef.current = scrollContainerRef.current.scrollTop;
    }

    axios.get(`${base}/notifications?page=${page}&tab=${activeTab}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (page === 1) {
          setNotifications(res.data);
          setFilteredList(res.data);
        } else {
          setNotifications(prev => [...prev, ...res.data]);
          setFilteredList(prev => [...prev, ...res.data]);
        }
        setHasMore(res.data.length === 10);

        setShouldRestoreScroll(true);

      })
      .catch(err => {
        if (err.response?.status === 401) handleUnauthorized();
        else console.error(err);
      })
      .finally(() => setLoading(false));
  }, [page, activeTab]);

  useEffect(() => {
    setNotifications([]);
    setFilteredList([]);
    setPage(1);
    setHasMore(true);
  }, [activeTab]);

  const clearNotification = (id) => {
    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_BASE_URL;
    startLoading();

    axios.delete(`${base}/notifications/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        setFilteredList(prev => prev.filter(n => n.id !== id));
      })
      .catch(console.error)
      .finally(() => stopLoading());
  };

  const clearAllNotifications = () => {
    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_BASE_URL;

    Swal.fire({
      title: 'Are you sure?',
      text: 'All notifications will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, clear all!',
    }).then((result) => {
      if (result.isConfirmed) {
        startLoading();
        axios.delete(`${base}/notifications/clear_all`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(() => {
            setNotifications([]);
            setFilteredList([]);
            Swal.fire('Cleared!', 'All notifications have been cleared.', 'success');
          })
          .catch((err) => {
            console.error(err);
            Swal.fire('Error', 'Failed to clear notifications.', 'error');
          })
          .finally(() => stopLoading());
      }
    });
  };

  if (loading&& page === 1) {
    return (
      <div className="flex justify-center items-center h-40">
        <LoaderCircle className="w-6 h-6 text-gray-500 animate-spin" />
      </div>
    );
  }

  if (!loading && notifications.length === 0) {
    return (
      <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
        <p className="text-gray-600 text-lg">
          🔔 No notifications found.
        </p>
      </div>
    );
  }

  return (
     <div
    ref={scrollContainerRef}
    className="p-4 grid grid-cols-1 gap-4 overflow-y-auto max-h-[80vh]" // adjust height as needed
  >
      {filteredList.length > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={clearAllNotifications}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-md transition"
          >
            Clear All
          </button>
        </div>
      )}

      {filteredList.map((notification, idx) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          isLast={idx === filteredList.length - 1}
          onLastCardRef={lastNotificationRef}
          onClear={clearNotification}
        />
      ))}

      {/* {loading && page > 1 && (
        <div className="col-span-full flex justify-center items-center h-12">
          <LoaderCircle className="w-8 h-8 text-gray-500 animate-spin" />
        </div>
      )} */}
    </div>
  );
};

export default NotificationPage;