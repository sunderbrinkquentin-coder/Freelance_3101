import { motion } from 'framer-motion';

interface AgentBallProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  isListening?: boolean;
  isSpeaking?: boolean;
}

const AgentBall = ({
  size = 'medium',
  className = '',
  isListening = false,
  isSpeaking = false
}: AgentBallProps) => {
  const sizeMap = {
    small: { container: 150, sphere: 100 },
    medium: { container: 280, sphere: 200 },
    large: { container: 300, sphere: 250 }
  };

  const sizes = sizeMap[size];
  const streakCount = 6;

  const breatheAnimation = {
    scale: [1, 1.05, 1],
    boxShadow: [
      '0 0 80px rgba(64, 224, 208, 0.6), 0 0 120px rgba(64, 224, 208, 0.4), 0 0 160px rgba(64, 224, 208, 0.2)',
      '0 0 100px rgba(64, 224, 208, 0.7), 0 0 140px rgba(64, 224, 208, 0.5), 0 0 180px rgba(64, 224, 208, 0.3)',
      '0 0 80px rgba(64, 224, 208, 0.6), 0 0 120px rgba(64, 224, 208, 0.4), 0 0 160px rgba(64, 224, 208, 0.2)'
    ]
  };

  const listeningAnimation = {
    scale: [1, 1.08, 1],
    boxShadow: [
      '0 0 100px rgba(64, 224, 208, 0.7), 0 0 140px rgba(64, 224, 208, 0.5)',
      '0 0 120px rgba(64, 224, 208, 0.8), 0 0 160px rgba(64, 224, 208, 0.6)',
      '0 0 100px rgba(64, 224, 208, 0.7), 0 0 140px rgba(64, 224, 208, 0.5)'
    ]
  };

  const streakPositions = [
    { top: '20%', width: 80, height: 3, delay: 0 },
    { top: '35%', width: 60, height: 2, delay: 0.5 },
    { top: '50%', width: 70, height: 3, delay: 1 },
    { top: '65%', width: 90, height: 2, delay: 1.5 },
    { top: '80%', width: 65, height: 3, delay: 2 },
    { top: '30%', width: 75, height: 2, delay: 2.5 }
  ];

  return (
    <div
      className={`agent-ball-container relative flex items-center justify-center ${className}`}
      style={{
        width: `${sizes.container}px`,
        height: `${sizes.container}px`
      }}
    >
      <div className="absolute inset-0 pointer-events-none">
        {streakPositions.map((streak, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              top: streak.top,
              left: '50%',
              width: `${streak.width}px`,
              height: `${streak.height}px`,
              background: 'linear-gradient(90deg, transparent 0%, rgba(168, 85, 247, 0.9) 20%, rgba(192, 132, 252, 0.95) 50%, rgba(168, 85, 247, 0.9) 80%, transparent 100%)',
              filter: 'blur(1px)'
            }}
            initial={{ opacity: 0, x: -120, rotate: -5 }}
            animate={{
              opacity: [0, 0.6, 1, 0.6, 0],
              x: [-120, 120],
              rotate: [-5, 5]
            }}
            transition={{
              duration: isSpeaking ? 1.5 : 3,
              repeat: Infinity,
              delay: streak.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 rounded-full"
        style={{
          width: `${sizes.sphere}px`,
          height: `${sizes.sphere}px`,
          background: 'radial-gradient(circle at 30% 30%, #5ed4c8 0%, #40e0d0 40%, #359a91 100%)',
          boxShadow: '0 0 80px rgba(64, 224, 208, 0.6), 0 0 120px rgba(64, 224, 208, 0.4), 0 0 160px rgba(64, 224, 208, 0.2)'
        }}
        animate={isListening ? listeningAnimation : breatheAnimation}
        transition={{
          duration: isListening ? 2 : 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export default AgentBall;
