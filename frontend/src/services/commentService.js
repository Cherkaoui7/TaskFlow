import api from './api';

export const commentService = {
    async addComment(taskId, content) {
        const response = await api.post(`/tasks/${taskId}/comments`, { content });
        return response.data;
    },

    async deleteComment(commentId) {
        const response = await api.delete(`/comments/${commentId}`);
        return response.data;
    },
};
