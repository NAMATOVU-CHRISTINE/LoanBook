// components/ui/BaseComponents.js
import React from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

// Animated Card Component with gradient and shadow
export const GradientCard = ({ 
  children, 
  gradient = ['#3B82F6', '#2563EB'],
  style,
  onPress 
}) => {
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle = {
    transform: [{ scale: scaleAnim }]
  };

  const CardContent = (
    <Animated.View style={[styles.cardContainer, animatedStyle, style]}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {children}
      </LinearGradient>
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

// Stats Card with animation
export const StatsCard = ({ title, value, icon, gradient }) => {
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(20);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <GradientCard gradient={gradient} style={styles.statsCard}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={styles.statsTitle}>{title}</Text>
        <Text style={styles.statsValue}>{value}</Text>
      </Animated.View>
    </GradientCard>
  );
};

// Transaction List Item with swipe actions
export const TransactionItem = ({ title, amount, date, onPress }) => (
  <TouchableOpacity 
    style={styles.transactionItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.transactionContent}>
      <View>
        <Text style={styles.transactionTitle}>{title}</Text>
        <Text style={styles.transactionDate}>{date}</Text>
      </View>
      <Text style={[
        styles.transactionAmount,
        { color: amount >= 0 ? '#10B981' : '#EF4444' }
      ]}>
        ${Math.abs(amount).toLocaleString()}
      </Text>
    </View>
  </TouchableOpacity>
);

// Custom Button with gradient and loading state
export const GradientButton = ({ 
  title, 
  onPress, 
  loading, 
  gradient = ['#3B82F6', '#2563EB'],
  style 
}) => (
  <TouchableOpacity
    onPress={!loading ? onPress : null}
    activeOpacity={0.8}
    style={style}
  >
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.buttonGradient}
    >
      <Text style={styles.buttonText}>
        {loading ? 'Loading...' : title}
      </Text>
    </LinearGradient>
  </TouchableOpacity>
);

// Loan Card Component
export const LoanCard = ({ loanType, loanAmount, interestRate, repaymentDate, onPress }) => {
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle = {
    transform: [{ scale: scaleAnim }]
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View style={[styles.loanCardContainer, animatedStyle]}>
        <LinearGradient
          colors={['#4CAF50', '#2E7D32']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.loanCardGradient}
        >
          <Text style={styles.loanCardTitle}>{loanType}</Text>
          <Text style={styles.loanCardAmount}>Amount: UGX {loanAmount.toLocaleString()}</Text>
          <Text style={styles.loanCardInterest}>Interest Rate: {interestRate}%</Text>
          <Text style={styles.loanCardDate}>Repayment Date: {new Date(repaymentDate.seconds * 1000).toLocaleDateString()}</Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    padding: 16,
    minHeight: 100,
  },
  statsCard: {
    width: (width - 80) / 2,
    margin: 8,
  },
  statsTitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 8,
  },
  statsValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  iconContainer: {
    marginBottom: 12,
  },
  transactionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  transactionDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loanCardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  loanCardGradient: {
    padding: 16,
    minHeight: 100,
  },
  loanCardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  loanCardAmount: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  loanCardInterest: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  loanCardDate: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default {
  GradientCard,
  StatsCard,
  TransactionItem,
  GradientButton,
  LoanCard,
};