import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';
import { useRequestStore } from '../store/useRequestStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { SOCKET_EVENTS } from '../utils/constants';
import toast from 'react-hot-toast';

let socketInstance = null;

/**
 * Manages a singleton Socket.IO connection.
 *
 * Fixes applied:
 * - socketRef.current is NO LONGER returned from the hook body (accessing
 *   a ref during render is forbidden in React 19 concurrent mode).
 * - The hook now returns nothing; consumers that need the socket directly
 *   can use the module-level socketInstance, or we can expose a getter.
 */
export const useSocket = () => {
  const { user, isAuthenticated } = useAuthStore();
  const addIncomingRequest = useRequestStore((s) => s.addIncomingRequest);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const handleInventoryUpdate = useInventoryStore((s) => s.handleInventoryUpdate);
  // socketRef is used inside the effect only — never read during render
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Reuse singleton socket across remounts
    if (!socketInstance || !socketInstance.connected) {
      socketInstance = io('/', {
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });
    }
    socketRef.current = socketInstance;

    const socket = socketRef.current;

    // Server now auto-joins rooms via JWT middleware.
    // No need to emit room-join events from the client — kept as no-ops.
    socket.on('connect', () => {
      // Emit legacy events for backward compat (server ignores them now)
      socket.emit(SOCKET_EVENTS.JOIN_USER_ROOM, {});
      if (user.role === 'donor') socket.emit(SOCKET_EVENTS.JOIN_DONOR_ROOM, {});
      if (user.role === 'hospital') socket.emit(SOCKET_EVENTS.JOIN_HOSPITAL_ROOM, {});
    });

    // ── New blood request alert (for donors and hospitals) ──
    const onNewRequest = (data) => {
      // Donors should only get alerted if it matches their blood type (or compatible).
      // For simplicity, matching exact.
      if (user.role === 'donor' && data.bloodType !== user.bloodType) return;
      
      addIncomingRequest(data);
      if (user.role === 'donor') {
        toast(
          `🚨 ${data.bloodType} Needed — ${data.units} unit(s) at ${data.hospital?.name || data.hospital} · ${(data.urgency || '').toUpperCase()}`,
          { duration: 8000, style: { background: '#16161f', border: '1px solid rgba(220,20,60,0.4)', color: '#fff' } }
        );
      } else {
        toast.success(`New Blood Request: ${data.bloodType} needed!`);
      }
    };

    // ── In-app notification ──
    const onNewNotification = (data) => {
      addNotification(data);
    };

    // ── Request status update ──
    const onStatusUpdate = (data) => {
      toast.success(`Request for ${data.patientName}: ${data.status}`, {
        style: { background: '#16161f', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
      });
    };

    // ── Inventory update ──
    const onInventoryUpdate = (data) => {
      handleInventoryUpdate(data);
    };

    socket.on(SOCKET_EVENTS.NEW_BLOOD_REQUEST, onNewRequest);
    socket.on(SOCKET_EVENTS.NEW_NOTIFICATION, onNewNotification);
    socket.on(SOCKET_EVENTS.REQUEST_STATUS_UPDATE, onStatusUpdate);
    socket.on(SOCKET_EVENTS.INVENTORY_UPDATE, onInventoryUpdate);

    return () => {
      // Remove only the specific named listeners, not all handlers for an event
      socket.off(SOCKET_EVENTS.NEW_BLOOD_REQUEST, onNewRequest);
      socket.off(SOCKET_EVENTS.NEW_NOTIFICATION, onNewNotification);
      socket.off(SOCKET_EVENTS.REQUEST_STATUS_UPDATE, onStatusUpdate);
      socket.off(SOCKET_EVENTS.INVENTORY_UPDATE, onInventoryUpdate);
      socket.off('connect');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?._id]);

  // Return nothing — do NOT return socketRef.current from the hook body.
  // Accessing a ref value during render is prohibited in React 19.
};
