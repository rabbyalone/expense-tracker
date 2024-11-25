'use client'
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa'; 
import { db } from '../firebase'; 

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);

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

  const deposits = transactions.filter((txn) => txn.amount > 0);
  const expenses = transactions.filter((txn) => txn.amount < 0);

  const totalDeposits = deposits.reduce((sum, txn) => sum + txn.amount, 0);
  const totalExpenses = expenses.reduce((sum, txn) => sum + Math.abs(txn.amount), 0);
  const currentBalance = totalDeposits - totalExpenses;
 
  return (
    <div className="container mx-auto p-4">
      {/* Balance Section */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Badminton 24-25</h1>
        <h2 className="text-xl font-bold underline mt-2 bg-green-100 p-3 ">Balance: BDT  {currentBalance.toFixed(2)}</h2>
        <h3 className="text-green-600">Deposits: BDT  {totalDeposits.toFixed(2)}</h3>
        <h3 className="text-red-600">Expenses: BDT  {totalExpenses.toFixed(2)}</h3>
      </div>

      {/* Transaction History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Deposits Column */}
        <div>
          <h2 className="text-lg font-semibold text-green-600">Deposits</h2>
          {deposits.map((txn) => (
            <div
              key={txn.id}
              className="flex justify-between items-center bg-green-100 p-3 rounded mb-2 shadow-md"
            >
              <div>
                <p className="font-bold">BDT  {txn.amount.toFixed(2)}</p>
                <p className="text-sm">{txn.description}</p>
                <p className="text-xs text-gray-500">{new Date(txn.date).toLocaleDateString()}</p>
              </div>
              <button
                className="text-green-500 hover:text-green-700"
                aria-label="Success"
              >
                <FaCheckCircle size={18} />
              </button>
            </div>
          ))}
          <h3 className="text-right font-semibold text-green-600">
            Subtotal: BDT  {totalDeposits.toFixed(2)}
          </h3>
        </div>

        {/* Expenses Column */}
        <div>
          <h2 className="text-lg font-semibold text-red-600">Expenses</h2>
          {expenses.map((txn) => (
            <div
              key={txn.id}
              className="flex justify-between items-center bg-red-100 p-3 rounded mb-2 shadow-md"
            >
              <div>
                <p className="font-bold">BDT  {Math.abs(txn.amount).toFixed(2)}</p>
                <p className="text-sm">{txn.description}</p>
                <p className="text-xs text-gray-500">{new Date(txn.date).toLocaleDateString()}</p>
              </div>
              <button
                className="text-red-500 hover:text-red-700"
                aria-label="Delete transaction"
              >
                <FaCheckCircle size={18} />
              </button>
            </div>
          ))}
          <h3 className="text-right font-semibold text-red-600">
            Subtotal: BDT  {totalExpenses.toFixed(2)}
          </h3>
        </div>
      </div>
    </div>
  );
}
