import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Billing.css';

function Billing() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: '', contact: '' });
  const [billText, setBillText] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
      setFiltered(res.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleAddToCart = (item) => {
    const qty = parseInt(prompt(`Enter quantity for ${item.name} (Available: ${item.quantity})`), 10);
    if (isNaN(qty) || qty <= 0) return alert('Invalid quantity');
    if (qty > item.quantity) return alert(`Only ${item.quantity} available`);

    let total = qty * item.price;
    let discount = 0;

    if (qty >= 5) discount = 0.10;
    else if (qty >= 3) discount = 0.05;

    const discountedTotal = total - (total * discount);
    alert(`Discount Applied: ${(discount * 100).toFixed(0)}%`);

    setCart([...cart, { ...item, qty, total: discountedTotal, discount }]);
  };

  const handleGenerateBill = async () => {
    if (!customer.name || !customer.contact) {
      alert('Please enter customer name and contact');
      return;
    }
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    let total = 0, discountAmt = 0;
    let lines = `\t\tZenventory\nPhone No. 937304****, Fairborn-34567\n${'='.repeat(46)}\nCustomer Name: ${customer.name}\tPhone No.: ${customer.contact}\nBill No.: ${Date.now()}\t\tDate: ${(new Date()).toLocaleDateString()}\n${'='.repeat(46)}\nProduct Name\t\tQTY\tPrice\n`;

    cart.forEach(item => {
      lines += `${item.name}\t\t${item.qty}\t${item.total.toFixed(2)}\n`;
      total += item.total;
      discountAmt += item.total * item.discount;
    });

    try {
      // Check loyalty
      const loyaltyRes = await axios.post('http://localhost:5000/api/loyalty/check', customer);
      let loyaltyDiscount = 0;
      if (loyaltyRes.data.exists) {
        loyaltyDiscount = 0.05;
        alert('Returning customer - additional 5% discount applied!');
        // Add loyalty coins API call here if needed
      } else {
        await axios.post('http://localhost:5000/api/loyalty/register', customer);
      }

      const loyaltyAmount = total * loyaltyDiscount;
      const netPay = total - discountAmt - loyaltyAmount;

      lines += `${'='.repeat(46)}\nBill Amount\t\t\tRs.${total.toFixed(2)}\n`;
      lines += `Discount\tRs.${discountAmt.toFixed(2)}\n`;
      lines += `Loyalty Discount\tRs.${loyaltyAmount.toFixed(2)}\n`;
      lines += `Net Pay\t\t\tRs.${netPay.toFixed(2)}\n`;
      lines += `${'='.repeat(46)}\nThank You for your Business!`;

      // Send bill + cart + customer to backend
      await axios.post('http://localhost:5000/api/generate-bill', { customer, cart });

      alert('Bill generated and inventory updated!');
      setBillText(lines);
      setCart([]);
      setCustomer({ name: '', contact: '' });
      fetchProducts();  // Refresh product list with updated quantities

      // Download bill as .txt file
      const element = document.createElement('a');
      const file = new Blob([lines], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `bill_${Date.now()}.txt`;
      document.body.appendChild(element);
      element.click();

    } catch (error) {
      alert('Failed to generate bill or update inventory');
      console.error(error);
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* Left: Product Filter */}
      <div style={{ flex: 1, padding: '10px' }}>
        <h3>Products</h3>
        <input
          placeholder="Search products..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setFiltered(products.filter(p => p.name.toLowerCase().includes(e.target.value.toLowerCase())));
          }}
        />
        <ul>
          {(search ? filtered : products).map(p => (
            <li key={p._id}>
              {p.name} (Available: {p.quantity}) - Rs.{p.price} 
              <button onClick={() => handleAddToCart(p)} style={{ marginLeft: '10px' }}>Add</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Middle: Customer & Cart Details */}
      <div style={{ flex: 1, padding: '10px' }}>
        <h3>Customer Details</h3>
        <input
          placeholder="Name"
          value={customer.name}
          onChange={e => setCustomer({ ...customer, name: e.target.value })}
          style={{ display: 'block', marginBottom: '10px' }}
        />
        <input
          placeholder="Contact"
          value={customer.contact}
          onChange={e => setCustomer({ ...customer, contact: e.target.value })}
          style={{ display: 'block', marginBottom: '10px' }}
        />
        <h4>Cart Items</h4>
        <ul>
          {cart.map((item, index) => (
            <li key={index}>
              {item.name} - {item.qty} pcs - Rs.{item.total.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>

      {/* Right: Bill Section */}
      <div style={{ flex: 1, padding: '10px' }}>
        <h3>Bill</h3>
        <button onClick={handleGenerateBill} style={{ marginBottom: '10px' }}>Generate Bill</button>
        <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f5f5f5', padding: '10px' }}>
          {billText}
        </pre>
      </div>
    </div>
  );
}

export default Billing;
