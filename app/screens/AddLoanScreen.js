import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'react-native-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const AddLoanScreen = ({ navigation }) => {
  const [loanType, setLoanType] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [repaymentDate, setRepaymentDate] = useState(new Date());
  const [borrowerName, setBorrowerName] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle date picker
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setRepaymentDate(selectedDate);
    }
  };

  // Validate inputs
  const validateInputs = () => {
    if (!loanType || !loanAmount || !interestRate || !borrowerName) {
      Alert.alert('Error', 'Please fill in all fields.');
      return false;
    }
    if (isNaN(loanAmount) || isNaN(interestRate)) {
      Alert.alert('Error', 'Loan amount and interest rate must be numbers.');
      return false;
    }
    return true;
  };

  // Save loan to Firestore
  const handleAddLoan = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'loans'), {
        loanType,
        loanAmount: parseFloat(loanAmount),
        interestRate: parseFloat(interestRate),
        repaymentDate,
        borrowerName,
        status: 'active', // Default status
        createdAt: new Date(),
      });
      Alert.alert('Success', 'Loan added successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding loan: ', error);
      Alert.alert('Error', 'Failed to add loan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1a237e', '#4a148c']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Loan Type Dropdown */}
        <View style={styles.inputContainer}>
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
            <Feather name="chevron-down" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Loan Amount */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Loan Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter loan amount"
            placeholderTextColor="#aaa"
            value={loanAmount}
            onChangeText={setLoanAmount}
            keyboardType="numeric"
          />
        </View>

        {/* Interest Rate */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Interest Rate (%)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter interest rate"
            placeholderTextColor="#aaa"
            value={interestRate}
            onChangeText={setInterestRate}
            keyboardType="numeric"
          />
        </View>

        {/* Repayment Date */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Repayment Date</Text>
          <TouchableOpacity
            style={styles.datePicker}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {repaymentDate.toLocaleDateString()}
            </Text>
            <Feather name="calendar" size={20} color="#fff" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={repaymentDate}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
        </View>

        {/* Borrower Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Borrower Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter borrower name"
            placeholderTextColor="#aaa"
            value={borrowerName}
            onChangeText={setBorrowerName}
          />
        </View>

        {/* Add Loan Button */}
        <TouchableOpacity
          style={[styles.addButton, loading && styles.addButtonDisabled]}
          onPress={handleAddLoan}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addButtonText}>Add Loan</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
  },
  dropdownText: {
    color: '#fff',
    fontSize: 16,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
  },
  dateText: {
    color: '#fff',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#6c63ff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonDisabled: {
    backgroundColor: 'rgba(108, 99, 255, 0.5)',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddLoanScreen;