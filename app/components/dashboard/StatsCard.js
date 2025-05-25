export const StatsCard = ({ title, value, icon: Icon, gradient }) => (
  <div className={`bg-gradient-to-r ${gradient} rounded-xl p-6 text-white`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-opacity-80 text-white">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <Icon className="h-8 w-8 text-white text-opacity-60" />
    </div>
  </div>
);