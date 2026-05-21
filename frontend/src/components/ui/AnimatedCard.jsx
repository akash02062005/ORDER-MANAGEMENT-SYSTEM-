import React from 'react';
import { motion } from 'framer-motion';
import Card from './Card';
import { fadeIn, itemFadeIn } from '../../animations/fadeAnimation';

const AnimatedCard = ({ children, ...props }) => {
  return (
    <motion.div variants={itemFadeIn}>
      <Card {...props}>
        {children}
      </Card>
    </motion.div>
  );
};

export default AnimatedCard;
