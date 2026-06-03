import { useEffect, useState } from "react";
import { CheckCheck, Trash2 } from "lucide-react";
import { api } from "../api/client";
import { Empty, ErrorBox, Loading } from "../components/State";
import { fmtDate } from "../utils/format";

const Notifications = () => {
  const [notifications, setNotifications] = useState(null);
  const [error, setError] = useState("");
  const load = () => api("/notifications").then(setNotifications).catch((err) => setError(err.message));

  useEffect(() => { load(); }, []);
  if (!notifications) return <Loading label="Loading notifications" />;

  const markRead = async (id) => { 
    await api(`/notifications/${id}/read`, { method: "PATCH" }); 
    load(); 
    window.dispatchEvent(new Event("notificationsUpdated"));
  };
  const markAll = async () => { 
    await api("/notifications/read-all", { method: "PATCH" }); 
    load(); 
    window.dispatchEvent(new Event("notificationsUpdated"));
  };
  const remove = async (id) => { 
    await api(`/notifications/${id}`, { method: "DELETE" }); 
    load(); 
    window.dispatchEvent(new Event("notificationsUpdated"));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Notifications</h2>
          <p className="text-sm text-slate-500">Due date reminders, approval updates, reservation alerts, and fines.</p>
        </div>
        <button className="btn-secondary" onClick={markAll} disabled={!notifications.some((item) => !item.read)}><CheckCheck className="h-4 w-4" /> Mark all read</button>
      </div>
      {error && <ErrorBox message={error} />}
      {notifications.length ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div className={`rounded-lg border p-4 ${notification.read ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50"}`} key={notification._id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{notification.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                  <p className="mt-2 text-xs text-slate-500">{fmtDate(notification.createdAt)} - {notification.type}</p>
                </div>
                <div className="flex gap-2">
                  {!notification.read && <button className="btn-secondary" onClick={() => markRead(notification._id)}>Read</button>}
                  <button className="btn-secondary text-rose-600" onClick={() => remove(notification._id)}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : <Empty title="No notifications" text="Alerts from library actions will appear here." />}
    </div>
  );
};

export default Notifications;
