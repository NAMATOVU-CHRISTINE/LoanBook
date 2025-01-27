import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Animated,
  Dimensions,
  ImageBackground,
  Platform,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { PieChart, LineChart, BarChart } from 'react-native-chart-kit';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const BalanceSheetScreen = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [balanceData, setBalanceData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [showTutorial, setShowTutorial] = useState(true);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Calculate financial metrics
  const calculateMetrics = (data) => {
    if (!data) return {};
    return {
      currentRatio: data.assets.totalAssets / data.liabilities.totalLiabilities,
      debtToEquity: data.liabilities.totalLiabilities / data.equity.totalEquity,
      quickRatio: (data.assets.cashAtHand + data.assets.cashAtBank) / data.liabilities.totalLiabilities,
      workingCapital: data.assets.totalAssets - data.liabilities.totalLiabilities
    };
  };

  // Enhanced data fetching with periodic snapshots
  useEffect(() => {
    const q = query(collection(db, 'transactions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = {
        assets: { cashAtHand: 0, cashAtBank: 0, debtors: 0, investments: 0 },
        liabilities: { loans: 0, accounts_payable: 0, short_term_debt: 0 },
        equity: { capital: 0, retainedEarnings: 0, reserves: 0 }
      };

      snapshot.docs.forEach(doc => {
        const transaction = doc.data();
        processTransaction(data, transaction);
      });

      calculateTotals(data);
      setBalanceData(data);
      setIsLoading(false);
      animateContent();
    });

    return () => unsubscribe();
  }, []);

  const processTransaction = (data, transaction) => {
    switch (transaction.transactionType) {
      case 'Income':
        data.assets.cashAtHand += transaction.amount;
        data.equity.retainedEarnings += transaction.amount;
        break;
      case 'Expense':
        data.assets.cashAtHand -= transaction.amount;
        data.equity.retainedEarnings -= transaction.amount;
        break;
      case 'Investment':
        data.assets.investments += transaction.amount;
        data.equity.capital += transaction.amount;
        break;
      // Add more transaction types as needed
    }
  };

  const calculateTotals = (data) => {
    ['assets', 'liabilities', 'equity'].forEach(category => {
      data[category][`total${category.charAt(0).toUpperCase() + category.slice(1)}`] = 
        Object.values(data[category]).reduce((a, b) => a + b, 0);
    });
  };

  const animateContent = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // Implement refresh logic here
    setRefreshing(false);
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
    }).format(value);
  };

  const renderMetricCard = (title, value, icon, trend) => (
    <Animated.View style={[styles.metricCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={isDarkMode ? ['#2c3e50', '#3498db'] : ['#e0f7fa', '#80deea']}
        style={styles.gradientCard}
      >
        <MaterialCommunityIcons name={icon} size={24} color={isDarkMode ? '#fff' : '#000'} />
        <Text style={[styles.metricTitle, isDarkMode && styles.darkModeText]}>{title}</Text>
        <Text style={[styles.metricValue, isDarkMode && styles.darkModeText]}>{value}</Text>
        {trend && (
          <View style={styles.trendContainer}>
            <Feather 
              name={trend > 0 ? 'trending-up' : 'trending-down'} 
              size={16} 
              color={trend > 0 ? '#4CAF50' : '#F44336'} 
            />
            <Text style={[styles.trendText, { color: trend > 0 ? '#4CAF50' : '#F44336' }]}>
              {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#6c63ff" />
      </View>
    );
  }

  const metrics = calculateMetrics(balanceData);

  return (
    <ImageBackground
      source={require('../../assets/images/background-pattern.jpg')}
      style={styles.container}
    >
      <BlurView intensity={isDarkMode ? 70 : 50} style={StyleSheet.absoluteFill} />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, isDarkMode && styles.darkModeText]}>
            Financial Overview
          </Text>
          <Text style={[styles.headerSubtitle, isDarkMode && styles.darkModeText]}>
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => handleExport(balanceData)} style={styles.iconButton}>
            <Feather name="download" size={24} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
          <Switch
            value={isDarkMode}
            onValueChange={() => setIsDarkMode(!isDarkMode)}
            trackColor={{ false: '#767577', true: '#6c63ff' }}
            thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['weekly', 'monthly', 'yearly'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive,
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics Grid */}
        <View style={styles.metricsGrid}>
          {renderMetricCard('Current Ratio', metrics.currentRatio.toFixed(2), 'chart-line', 5.2)}
          {renderMetricCard('Quick Ratio', metrics.quickRatio.toFixed(2), 'flash', -2.1)}
          {renderMetricCard('Debt to Equity', metrics.debtToEquity.toFixed(2), 'scale-balance', 1.8)}
          {renderMetricCard('Working Capital', 
            formatCurrency(metrics.workingCapital), 'cash', 3.4)}
        </View>

        {/* Assets Chart Section */}
        <Animated.View style={[styles.chartContainer, { transform: [{ translateY: slideAnim }] }]}>
          <Text style={[styles.chartTitle, isDarkMode && styles.darkModeText]}>
            Assets Distribution
          </Text>
          <PieChart
            data={[
              {
                name: 'Cash',
                population: balanceData.assets.cashAtHand,
                color: '#FF9800',
                legendFontColor: isDarkMode ? '#fff' : '#000',
              },
              {
                name: 'Bank',
                population: balanceData.assets.cashAtBank,
                color: '#4CAF50',
                legendFontColor: isDarkMode ? '#fff' : '#000',
              },
              {
                name: 'Investments',
                population: balanceData.assets.investments,
                color: '#2196F3',
                legendFontColor: isDarkMode ? '#fff' : '#000',
              },
            ]}
            width={width - 40}
            height={220}
            chartConfig={{
              backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
              backgroundGradientFrom: isDarkMode ? '#1e1e1e' : '#fff',
              backgroundGradientTo: isDarkMode ? '#1e1e1e' : '#fff',
              color: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        </Animated.View>

        {/* Financial Summary Cards */}
        <View style={styles.summaryContainer}>
          {['assets', 'liabilities', 'equity'].map((category) => (
            <Animated.View 
              key={category}
              style={[styles.summaryCard, { transform: [{ scale: scaleAnim }] }]}
            >
              <LinearGradient
                colors={isDarkMode ? ['#2c3e50', '#3498db'] : ['#e0f7fa', '#80deea']}
                style={styles.gradientCard}
              >
                <Text style={[styles.summaryTitle, isDarkMode && styles.darkModeText]}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
                <Text style={[styles.summaryTotal, isDarkMode && styles.darkModeText]}>
                  {formatCurrency(balanceData[category][`total${category.charAt(0).toUpperCase() + category.slice(1)}`])}
                </Text>
                {Object.entries(balanceData[category])
                  .filter(([key]) => !key.startsWith('total'))
                  .map(([key, value]) => (
                    <View key={key} style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, isDarkMode && styles.darkModeText]}>
                        {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Text>
                      <Text style={[styles.summaryValue, isDarkMode && styles.darkModeText]}>
                        {formatCurrency(value)}
                      </Text>
                    </View>
                  ))}
              </LinearGradient>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    marginBottom: 10,
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  periodButtonActive: {
    backgroundColor: '#6c63ff',
  },
  periodButtonText: {
    color: '#666',
    fontSize: 14,
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 15,
  },
  metricCard: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  gradientCard: {
    padding: 15,
    borderRadius: 15,
  },
  metricTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  trendText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: 'bold',
  },
  chartContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 15,
    margin: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000',
  },
  summaryContainer: {
    padding: 15,
  },
  summaryCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  summaryTotal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  darkModeText: {
    color: '#fff',
  },
  darkModeContainer: {
    backgroundColor: '#121212',
  },
  // Animation helper styles
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Tutorial overlay styles
  tutorialOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  tutorialCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  tutorialText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  tutorialButton: {
    backgroundColor: '#6c63ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  tutorialButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

// Add these utility functions at the end of the file
const handleExport = async (data) => {
  if (!data) {
    Alert.alert('Export Error', 'No data available to export');
    return;
  }

  try {
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `balance_sheet_${timestamp}.csv`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    // Create CSV content
    const csvRows = [];
    csvRows.push(['Balance Sheet Summary - ' + timestamp]);
    csvRows.push([]);
    
    // Assets Section
    csvRows.push(['ASSETS']);
    Object.entries(data.assets).forEach(([key, value]) => {
      csvRows.push([key, value.toLocaleString()]);
    });
    csvRows.push([]);
    
    // Liabilities Section
    csvRows.push(['LIABILITIES']);
    Object.entries(data.liabilities).forEach(([key, value]) => {
      csvRows.push([key, value.toLocaleString()]);
    });
    csvRows.push([]);
    
    // Equity Section
    csvRows.push(['EQUITY']);
    Object.entries(data.equity).forEach(([key, value]) => {
      csvRows.push([key, value.toLocaleString()]);
    });
    
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    
    await FileSystem.writeAsStringAsync(fileUri, csvContent);
    
    if (Platform.OS === 'ios') {
      await Sharing.shareAsync(fileUri, { UTI: 'public.comma-separated-values-text' });
    } else {
      await Sharing.shareAsync(fileUri, { mimeType: 'text/csv' });
    }

    Alert.alert('Success', 'Balance sheet exported successfully');
  } catch (error) {
    console.error('Export failed:', error);
    Alert.alert(
      'Export Error',
      'Failed to export balance sheet. Please try again.'
    );
  }
};

export default BalanceSheetScreen;