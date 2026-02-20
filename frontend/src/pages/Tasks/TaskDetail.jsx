import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { taskService } from '../../services/taskService';
import { commentService } from '../../services/commentService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import echo from '../../services/echo';

const STATUS_OPTIONS = [
  { value: 'todo', label: 'A faire' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'done', label: 'Termine' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Basse' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Haute' },
  { value: 'critical', label: 'Critique' },
];

export const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setCommentSubmitting(true);
      const response = await commentService.addComment(task.id, newComment);
      const addedComment = response.comment || response;
      setTask((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), addedComment],
      }));
      setNewComment('');
      toast.success('Commentaire ajoute');
    } catch {
      toast.error("Erreur lors de l'ajout du commentaire");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Supprimer ce commentaire ?')) return;

    try {
      await commentService.deleteComment(commentId);
      setTask((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c.id !== commentId),
      }));
      toast.success('Commentaire supprime');
    } catch {
      toast.error('Erreur lors de la suppression du commentaire');
    }
  };

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const data = await taskService.getTask(id);
        setTask(data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Erreur lors du chargement de la tache');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();

    const channel = echo.private(`tasks.${id}`);
    channel.listen('TaskUpdated', (e) => {
      setTask(e.task);
    });

    return () => {
      channel.stopListening('TaskUpdated');
    };
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (!task || newStatus === task.status) return;

    try {
      setUpdating(true);
      const response = await taskService.updateTaskStatus(task.id, newStatus);
      setTask(response.task || { ...task, status: newStatus });
      toast.success('Statut mis a jour');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise a jour du statut');
    } finally {
      setUpdating(false);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    if (!task || newPriority === task.priority) return;

    try {
      setUpdating(true);
      const response = await taskService.updateTask(task.id, {
        priority: newPriority,
      });
      setTask(response.task || { ...task, priority: newPriority });
      toast.success('Priorite mise a jour');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise a jour de la priorite');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssigneeChange = async (newAssigneeId) => {
    if (!task) return;
    const current = task.assigned_to ?? null;
    const next = newAssigneeId === '' ? null : Number(newAssigneeId);
    if (current === next) return;

    try {
      setUpdating(true);
      const response = await taskService.updateTask(task.id, {
        assigned_to: next,
      });
      setTask(response.task || { ...task, assigned_to: next });
      toast.success('Assignation mise a jour');
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la mise a jour de l'assignation");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Etes-vous sur de vouloir supprimer cette tache ? Cette action est irreversible.')) {
      return;
    }

    try {
      await taskService.deleteTask(task.id);
      toast.success('Tache supprimee avec succes');
      if (task.project_id) {
        navigate(`/projects/${task.project_id}`);
      } else {
        navigate('/my-tasks');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression de la tache');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8 text-center">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Tache introuvable ou vous n'avez pas acces a cette ressource.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600"
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-primary hover:underline mb-2 inline-block"
          >
            {'<-'} Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{task.title}</h1>
          {task.project && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Projet :{' '}
              <Link to={`/projects/${task.project_id}`} className="text-primary hover:underline">
                {task.project.name}
              </Link>
            </p>
          )}
        </div>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-danger text-white rounded-md hover:bg-red-600 shrink-0"
        >
          Supprimer
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <div>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</h2>
          <p className="text-gray-800 dark:text-gray-100">{task.description || 'Aucune description fournie.'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Statut</label>
            <select
              value={task.status}
              disabled={updating}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priorite</label>
            <select
              value={task.priority || 'medium'}
              disabled={updating}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            >
              {PRIORITY_OPTIONS.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Assignee a</h2>
            {task.project?.members?.length ? (
              <select
                value={task.assigned_to ?? ''}
                disabled={updating}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="">Non assignee</option>
                {task.project.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-gray-800 dark:text-gray-100">{task.assigned_user?.name || 'Non assignee'}</p>
            )}
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date limite</h2>
            <p
              className={
                task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'
                  ? 'text-danger font-medium'
                  : 'text-gray-800 dark:text-gray-100'
              }
            >
              {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Non definie'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Commentaires</h2>

        <div className="space-y-4">
          {task.comments?.length > 0 ? (
            task.comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {comment.user?.name?.charAt(0) || '?'}
                  </div>
                </div>
                <div className="flex-1 bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {comment.user?.name || 'Utilisateur inconnu'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                      {(user?.id === comment.user_id || user?.id === task.project?.user_id) && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-gray-400 dark:text-gray-500 hover:text-danger"
                          title="Supprimer"
                        >
                          x
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm italic">Aucun commentaire pour le moment.</p>
          )}
        </div>

        <form onSubmit={handleAddComment} className="mt-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary focus:border-primary min-h-[100px] dark:bg-gray-700 dark:text-white"
            required
            maxLength={1000}
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={commentSubmitting || !newComment.trim()}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {commentSubmitting ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
