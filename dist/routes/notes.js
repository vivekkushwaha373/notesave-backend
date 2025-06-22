"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/notes.ts
const express_1 = require("express");
const notesController_1 = require("../controllers/notesController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes are protected
router.use(auth_1.authenticateToken);
// Notes CRUD operations
router.get('/', notesController_1.getNotes);
router.get('/search', notesController_1.searchNotes);
router.get('/stats', notesController_1.getNotesStats);
router.get('/:id', notesController_1.getNoteById);
router.post('/', validation_1.validateNote, notesController_1.createNote);
router.put('/:id', validation_1.validateNoteUpdate, notesController_1.updateNote);
router.delete('/:id', notesController_1.deleteNote);
router.delete('/', notesController_1.deleteMultipleNotes);
exports.default = router;
