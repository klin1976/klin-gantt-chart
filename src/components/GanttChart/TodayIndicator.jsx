import React from 'react';
import PropTypes from 'prop-types';

/**
 * Renders a vertical line indicating today's date on the Gantt chart timeline.
 * 
 * @param {Object} props - The component props.
 * @param {number} props.positionPx - The horizontal position in pixels.
 * @returns {React.ReactElement} The TodayIndicator component.
 */
export default function TodayIndicator({ positionPx }) {
  return (
    <div
      className="absolute top-0 bottom-0 border-l-2 border-red-400/50 z-20 pointer-events-none"
      style={{ left: `${positionPx}px` }}
    >
      <div className="bg-red-400 text-[9px] text-white px-1 rounded-sm absolute top-0 -left-1 transform -translate-x-1/2 whitespace-nowrap">
        今天
      </div>
    </div>
  );
}

TodayIndicator.propTypes = {
  positionPx: PropTypes.number.isRequired
};
