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

const LoansScreen = () => {
  const [loans, setLoans] = useState([]);
  const [loanType, setLoanType] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [repaymentDate, setRepaymentDate] = useState(new Date());
  const [borrowerName, setBorrowerName] = useState('');
  const [aging, setAging] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch loans from Firestore
  useEffect(() => {
    const q = query(collection(db, 'loans'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loansData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLoans(loansData);
    });
    return () => unsubscribe();
  }, []);

  // Handle date picker
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setRepaymentDate(selectedDate);
    }
  };

  // Validate inputs
  const validateInputs = () => {
    if (!loanType || !loanAmount || !interestRate || !borrowerName || !aging) {
      Alert.alert('Error', 'Please fill in all fields.');
      return false;
    }
    if (isNaN(loanAmount) || isNaN(interestRate)) {
      Alert.alert('Error', 'Loan amount and interest rate must be numbers.');
      return false;
    }
    return true;
  };

  // Add a new loan
  const handleAddLoan = async () => {
    if (!validateInputs()) return;

    try {
      await addDoc(collection(db, 'loans'), {
        loanType,
        loanAmount: parseFloat(loanAmount),
        interestRate: parseFloat(interestRate),
        repaymentDate,
        borrowerName,
        aging,
        status: 'active',
        createdAt: new Date(),
      });
      Alert.alert('Success', 'Loan added successfully!');
      setIsModalVisible(false);
      resetForm();
    } catch (error) {
      console.error('Error adding loan: ', error);
      Alert.alert('Error', 'Failed to add loan. Please try again.');
    }
  };

  // Reset form fields
  const resetForm = () => {
    setLoanType('');
    setLoanAmount('');
    setInterestRate('');
    setRepaymentDate(new Date());
    setBorrowerName('');
    setAging('');
  };

  // Filter loans based on search query
  const filteredLoans = loans.filter((loan) =>
    loan.borrowerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Loans Management</Text>
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
          placeholder="Search by borrower name..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Loans List */}
      <FlatList
        data={filteredLoans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.loanCard}>
            <Text style={styles.loanName}>{item.borrowerName}</Text>
            <Text style={styles.loanDetails}>Type: {item.loanType}</Text>
            <Text style={styles.loanDetails}>Amount: ${item.loanAmount}</Text>
            <Text style={styles.loanDetails}>Interest: {item.interestRate}%</Text>
            <Text style={styles.loanDetails}>Due: {item.repaymentDate.toDate().toLocaleDateString()}</Text>
            <Text style={styles.loanDetails}>Aging: {item.aging}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />

      {/* Add Loan Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Loan</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Loan Type */}
            <Text style={styles.label}>Loan Type</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() =>
                Alert.alert(
                  'Loan Type',
                  'Select loan type',
                  [
                    { text: 'Personal', onPress: () => setLoanType('Personal') },
                    { text: 'Business', onPress: () => setLoanType('Business') },
                    { text: 'Education', onPress: () => setLoanType('Education') },
                  ],
                  { cancelable: true }
                )
              }
            >
              <Text style={styles.dropdownText}>
                {loanType || 'Select loan type'}
              </Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            {/* Loan Amount */}
            <Text style={styles.label}>Loan Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter loan amount"
              placeholderTextColor="#999"
              value={loanAmount}
              onChangeText={setLoanAmount}
              keyboardType="numeric"
            />

            {/* Interest Rate */}
            <Text style={styles.label}>Interest Rate (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter interest rate"
              placeholderTextColor="#999"
              value={interestRate}
              onChangeText={setInterestRate}
              keyboardType="numeric"
            />

            {/* Repayment Date */}
            <Text style={styles.label}>Repayment Date</Text>
            <TouchableOpacity
              style={styles.datePicker}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {repaymentDate.toLocaleDateString()}
              </Text>
              <Feather name="calendar" size={20} color="#666" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={repaymentDate}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}

            {/* Borrower Name */}
            <Text style={styles.label}>Borrower Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter borrower name"
              placeholderTextColor="#999"
              value={borrowerName}
              onChangeText={setBorrowerName}
            />

            {/* Aging */}
            <Text style={styles.label}>Aging</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter aging"
              placeholderTextColor="#999"
              value={aging}
              onChangeText={setAging}
            />

            {/* Add Loan Button */}
            <TouchableOpacity style={styles.addLoanButton} onPress={handleAddLoan}>
              <Text style={styles.addLoanButtonText}>Add Loan</Text>
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
  loanCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
  },
  loanName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loanDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
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
  addLoanButton: {
    backgroundColor: '#6c63ff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  addLoanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoansScreen;