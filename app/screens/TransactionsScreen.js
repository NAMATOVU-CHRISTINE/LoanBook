import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { collection, addDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

const TransactionsScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [transactionType, setTransactionType] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch transactions from Firestore
  useEffect(() => {
    const q = query(collection(db, 'transactions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactionsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTransactions(transactionsData);
    });
    return () => unsubscribe();
  }, []);

  // Handle date picker
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Validate inputs
  const validateInputs = () => {
    if (!transactionType || !amount || !description) {
      Alert.alert('Error', 'Please fill in all fields.');
      return false;
    }
    if (isNaN(amount)) {
      Alert.alert('Error', 'Amount must be a number.');
      return false;
    }
    return true;
  };

  // Add a new transaction
  const handleAddTransaction = async () => {
    if (!validateInputs()) return;

    try {
      await addDoc(collection(db, 'transactions'), {
        transactionType,
        amount: parseFloat(amount),
        date,
        description,
        status: 'completed', // Default status
        createdAt: new Date(),
      });
      Alert.alert('Success', 'Transaction added successfully!');
      setIsModalVisible(false);
      resetForm();
    } catch (error) {
      console.error('Error adding transaction: ', error);
      Alert.alert('Error', 'Failed to add transaction. Please try again.');
    }
  };

  // Reset form fields
  const resetForm = () => {
    setTransactionType('');
    setAmount('');
    setDate(new Date());
    setDescription('');
  };

  // Filter transactions based on search query
  const filteredTransactions = transactions.filter((transaction) =>
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Feather name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by description..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Transactions List */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.transactionCard}>
            <View style={styles.transactionHeader}>
              <Text style={styles.transactionType}>{item.transactionType}</Text>
              <Text style={styles.transactionAmount}>${item.amount}</Text>
            </View>
            <Text style={styles.transactionDescription}>{item.description}</Text>
            <Text style={styles.transactionDate}>
              {item.date.toDate().toLocaleDateString()}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />

      {/* Add Transaction Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Transaction</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Transaction Type */}
            <Text style={styles.label}>Transaction Type</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() =>
                Alert.alert(
                  'Transaction Type',
                  'Select transaction type',
                  [
                    { text: 'Income', onPress: () => setTransactionType('Income') },
                    { text: 'Expense', onPress: () => setTransactionType('Expense') },
                  ],
                  { cancelable: true }
                )
              }
            >
              <Text style={styles.dropdownText}>
                {transactionType || 'Select transaction type'}
              </Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            {/* Amount */}
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              placeholderTextColor="#999"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            {/* Date */}
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              style={styles.datePicker}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {date.toLocaleDateString()}
              </Text>
              <Feather name="calendar" size={20} color="#666" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter description"
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
            />

            {/* Add Transaction Button */}
            <TouchableOpacity style={styles.addTransactionButton} onPress={handleAddTransaction}>
              <Text style={styles.addTransactionButtonText}>Add Transaction</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
    backgroundColor: '#6c63ff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#4a47a3',
    padding: 10,
    borderRadius: 50,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    padding: 10,
  },
  transactionCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6c63ff',
  },
  transactionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    color: '#333',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  dropdownText: {
    color: '#333',
    fontSize: 16,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  dateText: {
    color: '#333',
    fontSize: 16,
  },
  addTransactionButton: {
    backgroundColor: '#6c63ff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  addTransactionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TransactionsScreen;