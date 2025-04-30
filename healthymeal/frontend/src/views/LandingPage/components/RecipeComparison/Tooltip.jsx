import React from 'react';
import styles from './Tooltip.module.css';

export const Tooltip = ({ text }) => {
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipContent}>
        {text}
      </div>
      <div className={styles.tooltipArrow} />
    </div>
  );
}; 