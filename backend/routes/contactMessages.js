const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * POST /api/contact-messages
 * Submit a new contact message (Public)
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newMessage = new ContactMessage({
      name,
      email,
      subject,
      message
    });

    await newMessage.save();
    res.status(201).json({ message: 'Message sent successfully!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/contact-messages
 * Get all contact messages (Admin only)
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    // For now, we assume any logged-in user with authMiddleware is an admin
    // Or we could check for a specific admin flag/role if implemented
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * PUT /api/contact-messages/:id
 * Mark a message as read (Admin only)
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status: 'read' },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE /api/contact-messages/:id
 * Delete a message (Admin only)
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ message: 'Message deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
