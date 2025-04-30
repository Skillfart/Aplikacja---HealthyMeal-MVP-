import React from 'react';
import styles from './FeatureCard.module.css';
import { Icon } from '../../../common/Icon/Icon';

export const FeatureCard = ({ title, description, iconName }) => {
  return (
    <div className={styles.featureCard}>
      <div className={styles.iconWrapper}>
        <Icon name={iconName} className={styles.icon} aria-hidden="true" />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </div>
  );
}; 