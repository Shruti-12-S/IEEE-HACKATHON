const StatCard = ({ label, value, icon: Icon, tone = "blue" }) => {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    teal: "bg-teal-50 text-teal-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700"
  };
  return (
    <div className="card flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-bold text-slate-900">{value ?? 0}</p>
      </div>
      {Icon && <div className={`rounded-lg p-3 ${tones[tone]}`}><Icon className="h-6 w-6" /></div>}
    </div>
  );
};

export default StatCard;
