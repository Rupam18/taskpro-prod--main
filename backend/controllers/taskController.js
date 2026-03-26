const Task = require('../models/Task');

// Get all tasks for a user (with optional project filtering)
exports.getTasks = async (req, res) => {
  const { projectId } = req.query;
  const filter = { userId: req.user.id };
  
  if (projectId) {
    filter.projectId = projectId;
  }

  try {
    const tasks = await Task.find(filter);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a task
exports.createTask = async (req, res) => {
  const { title, description, status, projectId } = req.body;

  try {
    const taskData = {
      title,
      description,
      status,
      userId: req.user.id,
    };

    if (projectId) {
      taskData.projectId = projectId;
    }

    const task = await Task.create(taskData);
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, projectId } = req.body;

  try {
    let task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    const updateData = { title, description, status };
    if (projectId !== undefined) {
      updateData.projectId = projectId;
    }

    task = await Task.findByIdAndUpdate(id, updateData, { new: true });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
