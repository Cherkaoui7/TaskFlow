import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { taskService } from '../../services/taskService';
import { useAuth } from '../../context/AuthContext';
import { TaskForm } from '../../components/tasks/TaskForm';
import { KanbanBoard } from '../../components/tasks/KanbanBoard';
import toast from 'react-hot-toast';
import echo from '../../services/echo';

export const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('kanban');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskFormSubmitting, setTaskFormSubmitting] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberResults, setMemberResults] = useState([]);
  const [memberRole, setMemberRole] = useState('member');
  const [memberLoading, setMemberLoading] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const data = await projectService.getProject(id);
      setProject(data);
    } catch {
      toast.error('Erreur lors du chargement du projet');
    }
  }, [id]);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await taskService.getTasks(id);
      setTasks(data.data || data);
    } catch {
      toast.error('Erreur lors du chargement des taches');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
    fetchTasks();

    const channel = echo.private(`projects.${id}`);

    channel.listen('TaskUpdated', (e) => {
      setTasks((prevTasks) => {
        const taskExists = prevTasks.find((t) => t.id === e.task.id);
        if (taskExists) {
          return prevTasks.map((t) => (t.id === e.task.id ? e.task : t));
        }
        return [...prevTasks, e.task];
      });
    });

    return () => {
      channel.stopListening('TaskUpdated');
    };
  }, [fetchProject, fetchTasks, id]);

  const handleCreateTask = async (formData) => {
    try {
      setTaskFormSubmitting(true);
      const response = await taskService.createTask(id, formData);
      const newTask = response.task || response;
      setTasks((prev) => [...prev, newTask]);
      toast.success('Tache creee avec succes');
      setShowTaskForm(false);
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la creation de la tache';
      toast.error(message);
    } finally {
      setTaskFormSubmitting(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      const response = await taskService.updateTaskStatus(taskId, status);
      const updated = response.task || null;
      setTasks((prev) => prev.map((task) => (task.id === taskId ? updated || { ...task, status } : task)));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise a jour du statut de la tache');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Etes-vous sur de vouloir supprimer ce projet ?')) {
      return;
    }

    try {
      await projectService.deleteProject(id);
      toast.success('Projet supprime avec succes');
      window.location.href = '/projects';
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const isAdmin =
    project?.members?.some((m) => m.id === user?.id && m.pivot?.role === 'admin') ||
    project?.user_id === user?.id;

  const handleSearchMembers = async (e) => {
    e.preventDefault();
    if (!memberSearch.trim()) return;

    try {
      setMemberLoading(true);
      const users = await projectService.searchUsers(memberSearch.trim());
      const existingIds = new Set(project.members?.map((m) => m.id) || []);
      setMemberResults(users.filter((u) => !existingIds.has(u.id)));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la recherche de membres');
    } finally {
      setMemberLoading(false);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      setMemberLoading(true);
      const response = await projectService.addMember(id, userId, memberRole);
      const updatedProject = response.project || null;
      if (updatedProject) {
        setProject(updatedProject);
      } else {
        await fetchProject();
      }
      toast.success('Membre ajoute avec succes');
      setMemberResults([]);
      setMemberSearch('');
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de l ajout du membre';
      toast.error(message);
    } finally {
      setMemberLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Etes-vous sur de vouloir retirer ce membre du projet ?')) {
      return;
    }

    try {
      setMemberLoading(true);
      await projectService.removeMember(id, userId);
      setProject((prev) => ({
        ...prev,
        members: prev.members.filter((m) => m.id !== userId),
      }));
      toast.success('Membre retire avec succes');
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors du retrait du membre';
      toast.error(message);
    } finally {
      setMemberLoading(false);
    }
  };

  if (loading || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/projects" className="text-primary hover:underline mb-4 inline-block">
          {'<-'} Retour aux projets
        </Link>
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">{project.description || 'Aucune description'}</p>
          </div>
          {isAdmin && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowTaskForm(true)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600"
              >
                Nouvelle tache
              </button>
              <Link
                to={`/projects/${id}/edit`}
                className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-md hover:bg-gray-900 dark:hover:bg-gray-600"
              >
                Modifier le projet
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-danger text-white rounded-md hover:bg-red-600"
              >
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      {showTaskForm && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Nouvelle tache</h2>
          <TaskForm
            onSubmit={handleCreateTask}
            onCancel={() => setShowTaskForm(false)}
            submitting={taskFormSubmitting}
            members={project.members || []}
          />
        </div>
      )}

      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'kanban'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Kanban
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'list'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Liste
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'members'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Membres
          </button>
        </nav>
      </div>

      {activeTab === 'kanban' && <KanbanBoard tasks={tasks} onStatusChange={handleUpdateTaskStatus} />}

      {activeTab === 'list' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Titre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Priorite</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Assigne a</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date limite</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/tasks/${task.id}`} className="text-primary hover:underline">
                      {task.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        task.status === 'done'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : task.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {task.status === 'done' ? 'Termine' : task.status === 'in_progress' ? 'En cours' : 'A faire'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        task.priority === 'critical'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : task.priority === 'high'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                          : task.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {task.assigned_user?.name || 'Non assigne'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Membres du projet</h3>
            {isAdmin && (
              <span className="text-xs text-gray-500 dark:text-gray-400">Vous pouvez ajouter ou retirer des membres.</span>
            )}
          </div>

          {isAdmin && (
            <form
              onSubmit={handleSearchMembers}
              className="flex flex-col md:flex-row md:items-end md:space-x-3 space-y-3 md:space-y-0"
            >
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rechercher un utilisateur (nom ou email)
                </label>
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  placeholder="Ex : jean.dupont@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                >
                  <option value="member">Membre</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={memberLoading}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {memberLoading ? 'Recherche...' : 'Rechercher'}
              </button>
            </form>
          )}

          {isAdmin && memberResults.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Resultats de recherche</h4>
              <div className="space-y-2">
                {memberResults.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/40 rounded"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{candidate.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{candidate.email}</p>
                    </div>
                    <button
                      type="button"
                      disabled={memberLoading}
                      onClick={() => handleAddMember(candidate.id)}
                      className="px-3 py-1 text-xs bg-primary text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                    >
                      Ajouter
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
            {project.members?.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/40 rounded"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{member.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      member.pivot?.role === 'admin'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {member.pivot?.role === 'admin' ? 'Admin' : 'Membre'}
                  </span>
                  {isAdmin && member.id !== project.user_id && (
                    <button
                      type="button"
                      disabled={memberLoading}
                      onClick={() => handleRemoveMember(member.id)}
                      className="px-3 py-1 text-xs bg-danger text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                    >
                      Retirer
                    </button>
                  )}
                </div>
              </div>
            ))}
            {(!project.members || project.members.length === 0) && (
              <p className="text-sm text-gray-500 dark:text-gray-400">Aucun membre pour l instant.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
