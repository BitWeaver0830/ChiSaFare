// controllers/tagController.js

const tagService = require('../services/tag.service');

exports.createTag = async (req, res) => {
  try {
    const tag = await tagService.createTag(req.body);
    res.status(201).json(tag);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getAllTags = async (req, res) => {
  try {
    const { query } = req;
    const tags = await tagService.getAllTags(query.search);
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTagById = async (req, res) => {
  try {
    const tag = await tagService.getTagById(req.params.id);
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    res.json(tag);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTag = async (req, res) => {
  try {
    const tag = await tagService.updateTag(req.params.id, req.body);
    res.json(tag);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    await tagService.deleteTag(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
