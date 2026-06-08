import React from 'react';

const ProductTimeline = ({ updates }) => {
  // Function to get status text
  const getStatusText = (status) => {
    switch (parseInt(status)) {
      case 0:
        return 'Created';
      case 1:
        return 'In Transit';
      case 2:
        return 'Delivered';
      default:
        return 'Unknown';
    }
  };

  // Function to get status icon
  const getStatusIcon = (status) => {
    switch (parseInt(status)) {
      case 0:
        return 'fas fa-plus-circle';
      case 1:
        return 'fas fa-truck';
      case 2:
        return 'fas fa-check-circle';
      default:
        return 'fas fa-question-circle';
    }
  };

  // Function to format date
  const formatDate = (timestamp) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString();
  };

  if (!updates || updates.length === 0) {
    return <div className="no-updates">No updates available</div>;
  }

  return (
    <div className="timeline">
      {updates.map((update, index) => (
        <div key={index} className="timeline-item">
          <div className="timeline-icon">
            <i className={getStatusIcon(update.status)}></i>
          </div>
          <div className="timeline-content">
            <h3 className="timeline-title">
              {getStatusText(update.status)}
            </h3>
            <p className="timeline-location">
              <i className="fas fa-map-marker-alt"></i> {update.location}
            </p>
            <p className="timeline-updater">
              Updated by: {update.updaterName} ({update.updaterCompany})
            </p>
            <p className="timeline-date">
              {formatDate(update.timestamp)}
            </p>
            {update.comments && (
              <p className="timeline-comments">
                <strong>Comments:</strong> {update.comments}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductTimeline;