import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Feather } from '@expo/vector-icons';

const FullReportScreen = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'transactions'));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReportData(data);
      } catch (error) {
        console.error('Error fetching report data: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a148c" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Full Report</Text>
      {reportData.length > 0 ? (
        reportData.map((item) => (
          <View key={item.id} style={styles.reportItem}>
            <Text style={styles.reportText}>Type: {item.transactionType}</Text>
            <Text style={styles.reportText}>Amount: UGX {item.amount.toLocaleString()}</Text>
            <Text style={styles.reportText}>Date: {new Date(item.date.seconds * 1000).toLocaleDateString()}</Text>
            <Text style={styles.reportText}>Description: {item.description}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noDataText}>No report data available</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a148c',
    marginBottom: 20,
  },
  reportItem: {
    backgroundColor: '#f3e5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  reportText: {
    fontSize: 16,
    color: '#4a148c',
  },
  noDataText: {
    fontSize: 16,
    color: '#4a148c',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default FullReportScreen;
