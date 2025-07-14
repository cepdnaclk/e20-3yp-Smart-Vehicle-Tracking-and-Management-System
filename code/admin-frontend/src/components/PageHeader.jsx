import React from 'react';

const PageHeader = ({ title, subtitle, icon: Icon, actions }) => {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
      <div className="d-flex align-items-center mb-3 mb-md-0">
        {Icon && (
          <div className="rounded-circle bg-primary p-3 me-3">
            <Icon size={24} className="text-white" />
          </div>
        )}
        <div>
          <h4 className="mb-0 fw-bold">{title}</h4>
          {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
        </div>
      </div>
      
      {actions && actions.length > 0 && (
        <div className="d-flex gap-2">
          {actions.map((action, index) => (
            <button
              key={index}
              className={`btn btn-${action.variant || 'primary'}`}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
