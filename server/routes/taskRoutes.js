const express = require('express');
const Task = require('../models/Task');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

// Create a new task
router.post('/tasks', protect,[ body('title').not().isEmpty().withMessage('Title is required'),
body('status').isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status'),
validate], async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all tasks with filtering, sorting, and pagination
router.get('/tasks', async (req, res) => {
  const { status, priority, sortBy, order = 'asc', limit = 10, page = 1 } = req.query;

  const query = {};
  if (status) query.status = status;
  if (priority) query.priority = priority;

  const options = {
    sort: { [sortBy]: order === 'asc' ? 1 : -1 },
    limit: parseInt(limit),
    skip: (page - 1) * limit,
  };

  try {
    const tasks = await Task.find(query, null, options);
    const totalTasks = await Task.countDocuments(query);
    res.status(200).json({ tasks, totalTasks, totalPages: Math.ceil(totalTasks / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single task by ID
router.get('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a task by ID
router.put('/tasks/:id', protect, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a task by ID
router.delete('/tasks/:id', protect, admin, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Search endpoint
router.get('/tasks/search', async (req, res) => {
    const { query } = req.query;
  
    try {
      const tasks = await Task.find({ $text: { $search: query } });
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;
