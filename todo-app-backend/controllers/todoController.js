const Todo = require("../models/Todo");

exports.getTodos = async (req, res) => {
  try {
    const todos = await Todo.findAll({
      order: [
        ['priority', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTodo = async (req, res) => {
  try {
    const { title, category, priority } = req.body;
    const todo = await Todo.create({ 
      title,
      category: category || 'general',
      priority: priority || 'medium'
    });
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed, category, priority } = req.body;
    const todo = await Todo.findByPk(id);
    if (!todo) return res.status(404).json({ error: "Todo not found" });
    await todo.update({ title, completed, category, priority });
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findByPk(id);
    if (!todo) return res.status(404).json({ error: "Todo not found" });
    await todo.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};