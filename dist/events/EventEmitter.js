"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventEmitter = void 0;
const events_1 = require("events");
class ApplicationEventEmitter extends events_1.EventEmitter {
    onUserRegistered(handler) {
        this.on('user:registered', handler);
    }
    onUserLoggedIn(handler) {
        this.on('user:logged_in', handler);
    }
    onUserProfileUpdated(handler) {
        this.on('user:profile_updated', handler);
    }
    onNoteCreated(handler) {
        this.on('note:created', handler);
    }
    onNoteViewed(handler) {
        this.on('note:viewed', handler);
    }
    onNoteDownloaded(handler) {
        this.on('note:downloaded', handler);
    }
    onAssignmentCreated(handler) {
        this.on('assignment:created', handler);
    }
    onAssignmentDue(handler) {
        this.on('assignment:due', handler);
    }
    onResourceCreated(handler) {
        this.on('resource:created', handler);
    }
    onResourceDownloaded(handler) {
        this.on('resource:downloaded', handler);
    }
    emitUserRegistered(data) {
        this.emit('user:registered', data);
    }
    emitUserLoggedIn(data) {
        this.emit('user:logged_in', data);
    }
    emitUserProfileUpdated(data) {
        this.emit('user:profile_updated', data);
    }
    emitNoteCreated(data) {
        this.emit('note:created', data);
    }
    emitNoteViewed(data) {
        this.emit('note:viewed', data);
    }
    emitNoteDownloaded(data) {
        this.emit('note:downloaded', data);
    }
    emitAssignmentCreated(data) {
        this.emit('assignment:created', data);
    }
    emitAssignmentDue(data) {
        this.emit('assignment:due', data);
    }
    emitResourceCreated(data) {
        this.emit('resource:created', data);
    }
    emitResourceDownloaded(data) {
        this.emit('resource:downloaded', data);
    }
}
exports.eventEmitter = new ApplicationEventEmitter();
//# sourceMappingURL=EventEmitter.js.map