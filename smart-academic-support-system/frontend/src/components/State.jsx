import { Loader2 } from "lucide-react";

export const Loading = ({ label = "Loading" }) => (
  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500">
    <Loader2 className="h-4 w-4 animate-spin" />
    {label}
  </div>
);

export const Empty = ({ title = "Nothing here yet", text = "Once data is available, it will appear here." }) => (
  <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
    <h3 className="font-semibold text-slate-800">{title}</h3>
    <p className="mt-1 text-sm text-slate-500">{text}</p>
  </div>
);

export const ErrorBox = ({ message }) => (
  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</div>
);
