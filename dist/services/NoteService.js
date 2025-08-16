"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteService = void 0;
const Note_1 = require("../models/Note");
const ContentService_1 = require("./ContentService");
class NoteService extends ContentService_1.ContentService {
    constructor() {
        super(Note_1.Note);
    }
    async findById(id, populateAuthor = false) {
        let query = this.model.findById(id);
        if (populateAuthor) {
            query = query.populate('author', 'firstName lastName fullName');
        }
        return await query;
    }
    async getExcerpt(id) {
        const note = await this.model.findById(id).select('content');
        if (!note)
            return null;
        return note.content.length > 200
            ? note.content.substring(0, 200) + '...'
            : note.content;
    }
    async findByTags(tags, options = {}) {
        const filter = { ...options.filter, tags: { $in: tags } };
        return await this.findAll({ ...options, filter });
    }
}
exports.NoteService = NoteService;
//# sourceMappingURL=NoteService.js.map