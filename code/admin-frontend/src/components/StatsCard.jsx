const StatsCard = ({ title, value, color }) => (
  <div className="card">
    <div className="card-body">
      <h6 className="text-muted mb-2">{title}</h6>
      <h3 className={color}>{value}</h3>
    </div>
  </div>
);

export default StatsCard;