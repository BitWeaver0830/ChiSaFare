// services/tagService.js

const models = require('../utils/MongoDB/models');
const Tag = models.tagModel;

exports.regAddTag = async (tagData) => {
  try {
    const existingTag = await Tag.findOne(tagData);
    if (existingTag) {
      return;
    }

    const createdTag = await Tag.create(tagData);
    return createdTag;
  } catch (error) {
    console.log(error.message)
  }
};

exports.createTag = async (tagData) => {
  try {
    const existingTag = await Tag.findOne(tagData);
    if (existingTag) {
      throw new Error('Tag already exists');
    }

    const createdTag = await Tag.create(tagData);
    return createdTag;
  } catch (error) {
    throw new Error(error.message);
  }
};
exports.getAllTags = async (search) => {
  let query = { status: true }; 
  if (search) {
    query.tag = { $regex: search, $options: 'i' };
  }
  return await Tag.find(query);
};

exports.getTagById = async (id) => {
  return await Tag.findById(id);
};

exports.updateTag = async (id, tagData) => {
  return await Tag.findByIdAndUpdate(id, tagData, { new: true });
};


exports.deleteTag = async (id) => {
  try {
    const updatedTag = await Tag.findByIdAndUpdate(
      id,
      { status: false }
    );

    if (!updatedTag) {
      throw new Error("Tag not found");
    }

    return "Tag is soft deleted successfully";
  } catch (error) {
    console.error("Error soft deleting tag:", error);
    throw error;
  }
};