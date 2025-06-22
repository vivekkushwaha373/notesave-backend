"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotesStats = exports.searchNotes = exports.deleteMultipleNotes = exports.deleteNote = exports.updateNote = exports.createNote = exports.getNoteById = exports.getNotes = void 0;
const Note_1 = __importDefault(require("../models/Note"));
// Get all notes for the authenticated user
const getNotes = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Get notes with pagination
        const notes = await Note_1.default.find({ user: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        // Get total count for pagination
        const totalNotes = await Note_1.default.countDocuments({ user: userId });
        const totalPages = Math.ceil(totalNotes / limit);
        return res.status(200).json({
            success: true,
            data: {
                notes,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalNotes,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching notes:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch notes',
            error: error instanceof Error ? error.message : 'Internal Server Error'
        });
    }
};
exports.getNotes = getNotes;
// Get a single note by ID
const getNoteById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const note = await Note_1.default.findOne({ _id: id, user: userId });
        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }
        return res.status(200).json({
            success: true,
            data: { note }
        });
    }
    catch (error) {
        console.error('Error fetching note:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch note',
            error: error instanceof Error ? error.message : 'Internal Server Error'
        });
    }
};
exports.getNoteById = getNoteById;
// Create a new note
const createNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.user._id;
        const note = await Note_1.default.create({
            title,
            content,
            user: userId
        });
        return res.status(201).json({
            success: true,
            message: 'Note created successfully',
            data: { note }
        });
    }
    catch (error) {
        console.error('Error creating note:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create note',
            error: error instanceof Error ? error.message : 'Internal Server Error'
        });
    }
};
exports.createNote = createNote;
// Update a note
const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const userId = req.user._id;
        // Check if at least one field is provided
        if (!title && !content) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least one field to update (title or content)'
            });
        }
        const note = await Note_1.default.findOne({ _id: id, user: userId });
        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }
        // Update fields if provided
        if (title !== undefined)
            note.title = title;
        if (content !== undefined)
            note.content = content;
        await note.save();
        return res.status(200).json({
            success: true,
            message: 'Note updated successfully',
            data: { note }
        });
    }
    catch (error) {
        console.error('Error updating note:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update note',
            error: error instanceof Error ? error.message : 'Internal Server Error'
        });
    }
};
exports.updateNote = updateNote;
// Delete a note
const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const note = await Note_1.default.findOne({ _id: id, user: userId });
        console.log('mynote: ', note);
        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }
        await Note_1.default.findByIdAndDelete(id);
        return res.status(200).json({
            success: true,
            message: 'Note deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting note:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete note',
            error: error instanceof Error ? error.message : 'Internal Server Error'
        });
    }
};
exports.deleteNote = deleteNote;
// Delete multiple notes
const deleteMultipleNotes = async (req, res) => {
    try {
        const { noteIds } = req.body;
        const userId = req.user._id;
        if (!Array.isArray(noteIds) || noteIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an array of note IDs to delete'
            });
        }
        // Delete notes that belong to the user
        const result = await Note_1.default.deleteMany({
            _id: { $in: noteIds },
            user: userId
        });
        return res.status(200).json({
            success: true,
            message: `${result.deletedCount} note(s) deleted successfully`,
            data: {
                deletedCount: result.deletedCount
            }
        });
    }
    catch (error) {
        console.error('Error deleting multiple notes:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete notes',
            error: error instanceof Error ? error.message : 'Internal Server Error'
        });
    }
};
exports.deleteMultipleNotes = deleteMultipleNotes;
// Search notes
const searchNotes = async (req, res) => {
    try {
        const { q } = req.query;
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }
        // Search in title and content using regex
        const searchRegex = new RegExp(q, 'i');
        const notes = await Note_1.default.find({
            user: userId,
            $or: [
                { title: { $regex: searchRegex } },
                { content: { $regex: searchRegex } }
            ]
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        // Get total count for pagination
        const totalNotes = await Note_1.default.countDocuments({
            user: userId,
            $or: [
                { title: { $regex: searchRegex } },
                { content: { $regex: searchRegex } }
            ]
        });
        const totalPages = Math.ceil(totalNotes / limit);
        return res.status(200).json({
            success: true,
            data: {
                notes,
                searchQuery: q,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalNotes,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    }
    catch (error) {
        console.error('Error searching notes:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to search notes',
            error: error instanceof Error ? error.message : 'Internal Server Error'
        });
    }
};
exports.searchNotes = searchNotes;
// Get notes statistics
const getNotesStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const totalNotes = await Note_1.default.countDocuments({ user: userId });
        // Get notes created in the last 7 days
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const recentNotes = await Note_1.default.countDocuments({
            user: userId,
            createdAt: { $gte: lastWeek }
        });
        // Get the most recent note
        const latestNote = await Note_1.default.findOne({ user: userId })
            .sort({ createdAt: -1 })
            .select('title createdAt');
        return res.status(200).json({
            success: true,
            data: {
                totalNotes,
                recentNotes,
                latestNote
            }
        });
    }
    catch (error) {
        console.error('Error fetching notes stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message || 'Failed to fetch notes statistics'
        });
    }
};
exports.getNotesStats = getNotesStats;
