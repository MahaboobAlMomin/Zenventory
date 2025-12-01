import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const Product = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', quantity: '' });
  const [listening, setListening] = useState(false);
  const [voiceStep, setVoiceStep] = useState(null); // 'command' | 'add_name' | 'add_price' | ...
  const [voiceTempData, setVoiceTempData] = useState({});
  const recognitionRef = useRef(null);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProducts();

    // Setup SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition API not supported in this browser');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      if (event.results.length > 0) {
        const transcript = event.results[0][0].transcript.trim().toLowerCase();
        console.log('Voice input:', transcript);
        handleVoiceResult(transcript);
      }
    };

    recognition.onend = () => {
      setListening(false);
      // Automatically restart listening if we are mid voice flow
      if (voiceStep) {
        startListening();
      }
    };

    recognitionRef.current = recognition;
  }, []); // run once

  // Speak helper
  const speak = (text) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel(); // cancel any ongoing speech
    }
    const utter = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utter);
  };

  const startListening = () => {
    if (recognitionRef.current && !listening) {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch (e) {
        console.log('Recognition already started:', e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  // Voice command flow handler
  const handleVoiceResult = async (input) => {
    if (!voiceStep) {
      // Step 1: expecting main command: add, update, delete
      if (input.includes('add')) {
        setVoiceStep('add_name');
        speak('Adding a new product. Please say the product name.');
      } else if (input.includes('delete')) {
        setVoiceStep('delete_name');
        speak('Please say the name of the product to delete.');
      } else if (input.includes('update')) {
        setVoiceStep('update_name');
        speak('Please say the product name you want to update.');
      } else {
        speak('Sorry, please say add, update, or delete.');
      }
    }

    // ADD FLOW
    else if (voiceStep === 'add_name') {
      setVoiceTempData({ name: input });
      setVoiceStep('add_price');
      speak(`Got product name ${input}. Please say the price.`);
    }
    else if (voiceStep === 'add_price') {
      let price = parseFloat(input.replace(/[^0-9.]/g, ''));
      if (isNaN(price)) {
        speak('Price not recognized. Please say the price as a number.');
        return;
      }
      setVoiceTempData(prev => ({ ...prev, price }));
      setVoiceStep('add_quantity');
      speak('Price set. Please say the quantity.');
    }
    else if (voiceStep === 'add_quantity') {
      let quantity = parseInt(input.replace(/[^0-9]/g, ''), 10);
      if (isNaN(quantity)) {
        speak('Quantity not recognized. Please say the quantity as a number.');
        return;
      }
      const newProduct = { ...voiceTempData, quantity };
      // Save product
      try {
        await axios.post('http://localhost:5000/api/products', newProduct);
        speak('Product added successfully.');
        fetchProducts();
      } catch {
        speak('Failed to add product.');
      }
      setVoiceStep(null);
      setVoiceTempData({});
      stopListening();
    }

    // DELETE FLOW
    else if (voiceStep === 'delete_name') {
      const product = products.find(p => p.name.toLowerCase() === input);
      if (!product) {
        speak(`Could not find product named ${input}. Please say the product name again.`);
        return;
      }
      setVoiceTempData({ product });
      setVoiceStep('delete_confirm');
      speak(`Are you sure you want to delete ${product.name}? Say yes to confirm.`);
    }
    else if (voiceStep === 'delete_confirm') {
      if (input === 'yes') {
        try {
          await axios.delete(`http://localhost:5000/api/products/${voiceTempData.product._id}`);
          speak(`${voiceTempData.product.name} deleted successfully.`);
          fetchProducts();
        } catch {
          speak('Failed to delete product.');
        }
      } else {
        speak('Deletion cancelled.');
      }
      setVoiceStep(null);
      setVoiceTempData({});
      stopListening();
    }

    // UPDATE FLOW
    else if (voiceStep === 'update_name') {
      const product = products.find(p => p.name.toLowerCase() === input);
      if (!product) {
        speak(`Could not find product named ${input}. Please say the product name again.`);
        return;
      }
      setEditingProduct(product._id);
      setFormData({ name: product.name, price: product.price, quantity: product.quantity });
      setVoiceTempData({ product });
      setVoiceStep('update_field');
      speak('What do you want to update? Name, price, or quantity?');
    }
    else if (voiceStep === 'update_field') {
      if (!['name', 'price', 'quantity'].includes(input)) {
        speak('Invalid field. Please say name, price, or quantity.');
        return;
      }
      setVoiceTempData(prev => ({ ...prev, field: input }));
      setVoiceStep('update_value');
      speak(`Please say the new ${input}.`);
    }
    else if (voiceStep === 'update_value') {
      const { product, field } = voiceTempData;
      let updatedData = { ...formData };

      if (field === 'price') {
        let price = parseFloat(input.replace(/[^0-9.]/g, ''));
        if (isNaN(price)) {
          speak('Price not recognized. Please say the price as a number.');
          return;
        }
        updatedData.price = price;
      } else if (field === 'quantity') {
        let quantity = parseInt(input.replace(/[^0-9]/g, ''), 10);
        if (isNaN(quantity)) {
          speak('Quantity not recognized. Please say the quantity as a number.');
          return;
        }
        updatedData.quantity = quantity;
      } else {
        updatedData.name = input;
      }
      setFormData(updatedData);

      // Save update
      try {
        await axios.put(`http://localhost:5000/api/products/${product._id}`, updatedData);
        speak('Product updated successfully.');
        fetchProducts();
      } catch {
        speak('Failed to update product.');
      }

      setEditingProduct(null);
      setVoiceStep(null);
      setVoiceTempData({});
      stopListening();
    }
  };

  // Handle manual form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manual form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await axios.put(`http://localhost:5000/api/products/${editingProduct}`, formData);
        alert('Product updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/products', formData);
        alert('Product added successfully');
      }
      setFormData({ name: '', price: '', quantity: '' });
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      alert('Failed to save product');
      console.error(error);
    }
  };

  // Manual edit
  const handleEdit = (product) => {
    setEditingProduct(product._id);
    setFormData({ name: product.name, price: product.price, quantity: product.quantity });
  };

  // Manual delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      alert('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      alert('Failed to delete product');
      console.error(error);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: 'auto', padding: 20 }}>
      <h2>Product Management</h2>

      <button
        onClick={() => {
          if (!listening) {
            speak('Welcome to product section. You can say add, update, or delete a product.');
            setVoiceStep('command');
            startListening();
          } else {
            stopListening();
            setVoiceStep(null);
          }
        }}
        style={{ marginBottom: '15px', padding: '12px 20px', fontSize: '18px', cursor: 'pointer' }}
      >
        {listening ? 'Stop Voice Control 🎙️' : 'Start Voice Control 🎤'}
      </button>

      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} required />
        <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required />
        <input type="number" name="quantity" placeholder="Quantity" value={formData.quantity} onChange={handleChange} required />
        <button type="submit">{editingProduct ? 'Update' : 'Add'} Product</button>
      </form>

      <h3>Product List</h3>
      <table border="1" cellPadding="10" width="100%" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th>Name</th>
            <th>Price ($)</th>
            <th>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((product) => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td>{product.price}</td>
                <td>{product.quantity}</td>
                <td>
                  <button onClick={() => handleEdit(product)}>Edit</button>{' '}
                  <button onClick={() => handleDelete(product._id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4">No products found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Product;
