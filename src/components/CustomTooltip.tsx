// CustomTooltip.tsx
import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const CustomTooltip: React.FC<{ text: string; id: string }> = ({ text, id }) => {
  return (
    <OverlayTrigger
      placement="bottom"
      overlay={
        <Tooltip id={id} className="custom-tooltip">
          <div className="tooltip-content">{text}</div>
        </Tooltip>
      }
    >
      {({ ref, ...triggerHandler }) => (
        <span
          ref={ref}
          {...triggerHandler}
          className="tooltip-icon"
          style={{ fontSize: '20px' }} // Увеличиваем размер напрямую через inline-стиль
        >
          <FontAwesomeIcon icon={faQuestionCircle} />
        </span>
      )}
    </OverlayTrigger>
  );
};

export default CustomTooltip;