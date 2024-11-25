'use client'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast'; // Install via `npm install react-hot-toast`
import { FaTrashAlt } from 'react-icons/fa';
import { db } from '../../firebase'; // Update with your Firebase setup

export default function Transaction() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transactions, setTransactions] = useState([]);

  // Fetch transactions from Firestore
  useEffect(() => {
    const fetchTransactions = async () => {
      const querySnapshot = await getDocs(collection(db, 'transactions'));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(data);
    };

    fetchTransactions();
  }, []);

  // Add a new transaction
  const addTransaction = async () => {
    if (!amount || !description) {
      toast.error('Please enter all fields.');
      return;
    }

    const transaction = {
      amount: parseFloat(amount),
      description,
      date: new Date().toISOString(),
    };

    try {
      const docRef = await addDoc(collection(db, 'transactions'), transaction);
      setTransactions([
        ...transactions,
        { id: docRef.id, ...transaction, date: new Date() },
      ]);
      toast.success('Transaction added successfully!');
      setAmount('');
      setDescription('');
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction.');
    }
  };

  // Delete a transaction with confirmation
  const deleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'transactions', id));
      setTransactions(transactions.filter((txn) => txn.id !== id));
      toast.success('Transaction deleted successfully!');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Toaster Notifications */}
      <Toaster position="top-right" />

      {/* Transaction Form */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Add Transaction</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="p-2 border rounded w-full"
          />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (positive for deposit, negative for expense)"
            className="p-2 border rounded w-full"
          />

        </div>
        <button
          onClick={addTransaction}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Transaction
        </button>
      </div>

      {/* Transaction History Table */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">Date</th>
                <th className="border border-gray-300 p-2">Description</th>
                <th className="border border-gray-300 p-2">Amount</th>
                <th className="border border-gray-300 p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center text-gray-500 p-4"
                  >
                    No transactions found.
                  </td>
                </tr>
              )}
              {transactions.map((txn) => (
                <tr key={txn.id}>
                  <td className="border border-gray-300 p-2">
                    {txn.date
                      ? new Date(txn.date).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {txn.description}
                  </td>
                  <td
                    className={`border border-gray-300 p-2 ${
                      txn.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {txn.amount > 0
                      ? `+${txn.amount.toFixed(2)}`
                      : txn.amount?.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <button
                      onClick={() => deleteTransaction(txn.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Delete transaction"
                    >
                      <FaTrashAlt size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
