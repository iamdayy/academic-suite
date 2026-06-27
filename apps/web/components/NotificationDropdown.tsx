"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle, Info, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import api from "@/lib/api";
import { usePathname, useRouter } from "next/navigation";

interface Notification {
  id: bigint;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, [pathname]);

  const handleRead = async (id: bigint, link?: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      if (link) {
        setIsOpen(false);
        router.push(link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReadAll = async () => {
    try {
      await api.patch(`/notifications/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'WARNING': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'ERROR': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative mr-2">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="font-semibold">Notifikasi</span>
          {unreadCount > 0 && (
            <Button variant="ghost" className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800" onClick={handleReadAll}>
              Tandai semua dibaca
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">Tidak ada notifikasi</div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n.id.toString()} 
                className={`flex gap-3 border-b p-4 transition-colors hover:bg-gray-50 cursor-pointer ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                onClick={() => handleRead(n.id, n.link)}
              >
                <div className="mt-1 flex-shrink-0">{getIcon(n.type)}</div>
                <div className="flex flex-col gap-1">
                  <span className={`text-sm ${!n.isRead ? 'font-semibold' : 'font-medium'}`}>{n.title}</span>
                  <span className="text-xs text-gray-500 line-clamp-2">{n.message}</span>
                  <span className="text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
