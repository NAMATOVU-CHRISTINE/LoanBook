import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { GradientCard, StatsCard, TransactionItem, GradientButton } from '../components/ui/BaseComponents';
import { Feather } from '@expo/vector-icons';
import Svg from 'react-native-svg'; // Import react-native-svg

const HomeScreen = ({ navigation }) => {
  const [totalAssets, setTotalAssets] = useState(0);
  const [totalLiabilities, setTotalLiabilities] = useState(0);
  const [netWorth, setNetWorth] = useState(0);
  const [monthlyProfit, setMonthlyProfit] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(-50);

  // Fetch data from Firestore
  useEffect(() => {
    // Trigger animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Fetch balance sheet data
    const unsubscribeBalanceSheet = onSnapshot(collection(db, 'balanceSheet'), (snapshot) => {
      const data = snapshot.docs[0]?.data();
      if (data) {
        const assets = (data.assets?.cashAtHand || 0) + (data.assets?.cashAtBank || 0) + (data.assets?.debtors || 0);
        const liabilities = data.liabilities?.loans || 0;
        setTotalAssets(assets);
        setTotalLiabilities(liabilities);
        setNetWorth(assets - liabilities);
      }
    });

    // Fetch monthly profit (interest earned - expenses)
    const unsubscribeProfit = onSnapshot(collection(db, 'monthlyProfit'), (snapshot) => {
      const data = snapshot.docs[0]?.data();
      if (data) {
        setMonthlyProfit(data.profit || 0);
      }
    });
 
    // Fetch recent transactions
    const unsubscribeTransactions = onSnapshot(
      query(collection(db, 'transactions'), orderBy('date', 'desc'), limit(5)),
      (snapshot) => {
        const transactions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate().toLocaleDateString(),
        }));
        setRecentTransactions(transactions);
      }
    );

    return () => {
      unsubscribeBalanceSheet();
      unsubscribeProfit();
      unsubscribeTransactions();
    };
  }, []);

  // Format money in UGX
  const formatMoney = (amount) => {
    return `UGX ${amount.toLocaleString()}`;
  };

  // Chart data
  const assetsData = [
    { name: 'Cash at Hand', value: 500000, color: '#4CAF50' },
    { name: 'Cash at Bank', value: 900000, color: '#2196F3' },
    { name: 'Debtors', value: 855000, color: '#FF9800' },
  ];

  const liabilitiesData = {
    labels: ['Loans', 'Equity'],
    datasets: [
      {
        data: [totalLiabilities, netWorth],
        colors: [
          (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
          (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        ],
      },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <StatusBar barStyle="light-content" backgroundColor="#222" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Feather name="user" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Summary Cards */}
        <Animated.View
          style={[
            styles.statsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]} 
        >
          <StatsCard
            title="Total Assets"
            value={formatMoney(totalAssets)}
            gradient={['#3B82F6', '#2563EB']}
            icon={<Feather name="dollar-sign" size={24} color="#fff" />}
          />
          <StatsCard
            title="Total Liabilities"
            value={formatMoney(totalLiabilities)}
            gradient={['#EF4444', '#DC2626']}
            icon={<Feather name="clipboard" size={24} color="#fff" />}
          />
          <StatsCard
            title="Net Worth"
            value={formatMoney(netWorth)}
            gradient={['#10B981', '#059669']}
            icon={<Feather name="trending-up" size={24} color="#fff" />}
          />
          <StatsCard
            title="Monthly Profit"
            value={formatMoney(monthlyProfit)}
            gradient={['#F59E0B', '#D97706']}
            icon={<Feather name="pie-chart" size={24} color="#fff" />}
          />
        </Animated.View>

        {/* Charts */}
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Assets Distribution</Text>
          <PieChart
            data={assetsData}
            width={Dimensions.get('window').width - 32}
            height={150}
            chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="15"
            svg={{ component: Svg }} // Use Svg component
          />
          <Text style={styles.sectionTitle}>Liabilities vs. Equity</Text>
          <BarChart
            data={liabilitiesData}
            width={Dimensions.get('window').width - 32}
            height={200}
            yAxisLabel="UGX "
            chartConfig={{
              backgroundColor: '#FFFFFF',
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            style={{ marginVertical: 16 }}
            svg={{ component: Svg }} // Use Svg component
          />
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                title={transaction.narration}
                amount={formatMoney(transaction.amount)}
                date={transaction.date}
                onPress={() => navigation.navigate('TransactionDetails', { transaction })}
              />
            ))
          ) : (
            <Text style={styles.noTransactionsText}>No recent transactions</Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actions}>
          <GradientButton
            title="Add Loan"
            onPress={() => navigation.navigate('AddLoan')}
            gradient={['#10B981', '#059669']}
            style={{ flex: 1, marginRight: 8 }}
          />
          <GradientButton
            title="Record Transaction"
            onPress={() => navigation.navigate('RecordTransaction')}
            gradient={['#3B82F6', '#2563EB']}
            style={{ flex: 1, marginLeft: 8 }}
          />
          <GradientButton
            title="View Full Report"
            onPress={() => navigation.navigate('FullReport')}
            gradient={['#F59E0B', '#D97706']}
            style={{ flex: 1, marginLeft: 8 }}
          />
        </View>
      </ScrollView>

      {/* Navigation Bar */}
      {/* <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Feather name="home" size={24} color="#3B82F6" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Loans')}>
          <Feather name="dollar-sign" size={24} color="#6B7280" />
          <Text style={styles.navText}>Loans</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Transactions')}>
          <Feather name="list" size={24} color="#6B7280" />
          <Text style={styles.navText}>Transactions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Feather name="user" size={24} color="#6B7280" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 80, // Space for the nav bar
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    display: 'flex',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  noTransactionsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});

export default HomeScreen;