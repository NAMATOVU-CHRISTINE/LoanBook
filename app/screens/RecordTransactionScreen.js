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

const RecordTransactionScreen = ({ navigation }) => {
  const [transactionType, setTransactionType] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // Save transaction to Firestore
  const handleAddTransaction = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'transactions'), {
        transactionType,
        amount: parseFloat(amount),
        date,
        description,
        createdAt: new Date(),
      });
      Alert.alert('Success', 'Transaction recorded successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error recording transaction: ', error);
      Alert.alert('Error', 'Failed to record transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1a237e', '#4a148c']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Transaction Type Dropdown */}
        <View style={styles.inputContainer}>
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
            <Feather name="chevron-down" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Amount */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            placeholderTextColor="#aaa"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>

        {/* Date */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.datePicker}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {date.toLocaleDateString()}
            </Text>
            <Feather name="calendar" size={20} color="#fff" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
        </View>

        {/* Description */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter description"
            placeholderTextColor="#aaa"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Add Transaction Button */}
        <TouchableOpacity
          style={[styles.addButton, loading && styles.addButtonDisabled]}
          onPress={handleAddTransaction}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addButtonText}>Record Transaction</Text>
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

export default RecordTransactionScreen;
