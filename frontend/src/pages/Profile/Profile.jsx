import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { authService } from '../../services/authService';
import { projectService } from '../../services/projectService';
import { taskService } from '../../services/taskService';
import toast from 'react-hot-toast';

const getList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const getInitials = (name) => {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
};

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.profile_picture || null);

  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({
    projects: 0,
    tasksTotal: 0,
    tasksDone: 0,
    tasksInProgress: 0,
    tasksOverdue: 0,
  });

  useEffect(() => {
    if (!isEditing) {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
      });
      setAvatarPreview(user?.profile_picture || null);
      setAvatar(null);
    }
  }, [user, isEditing]);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const [projectsPayload, tasksPayload] = await Promise.all([
          projectService.getProjects(),
          taskService.getMyTasks(),
        ]);

        const projects = getList(projectsPayload);
        const tasks = getList(tasksPayload);

        const now = new Date();
        const tasksDone = tasks.filter((t) => t.status === 'done').length;
        const tasksInProgress = tasks.filter((t) => t.status === 'in_progress').length;
        const tasksOverdue = tasks.filter((t) => {
          if (!t.due_date || t.status === 'done') return false;
          return new Date(t.due_date) < now;
        }).length;

        if (isMounted) {
          setStats({
            projects: projects.length,
            tasksTotal: tasks.length,
            tasksDone,
            tasksInProgress,
            tasksOverdue,
          });
        }
      } catch {
        if (isMounted) {
          toast.error('Unable to load profile stats');
        }
      } finally {
        if (isMounted) {
          setStatsLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const completionRate = useMemo(() => {
    if (!stats.tasksTotal) return 0;
    return Math.round((stats.tasksDone / stats.tasksTotal) * 100);
  }, [stats.tasksDone, stats.tasksTotal]);

  const memberSince = useMemo(() => {
    if (!user?.created_at) return 'Unknown';
    return new Date(user.created_at).toLocaleDateString('fr-FR');
  }, [user?.created_at]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatar(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview((prev) => {
      if (prev && prev.startsWith('blob:')) {
        URL.revokeObjectURL(prev);
      }
      return previewUrl;
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({ name: user?.name || '', email: user?.email || '' });
    setAvatarPreview(user?.profile_picture || null);
    setAvatar(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedUserResponse = await authService.updateProfile(formData);
      let finalUser = updatedUserResponse.user;

      if (avatar) {
        const formDataAvatar = new FormData();
        formDataAvatar.append('avatar', avatar);
        const avatarResponse = await authService.uploadAvatar(formDataAvatar);
        finalUser = avatarResponse.user;
      }

      updateUser(finalUser);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error while updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 md:p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={formData.name}
                  className="h-24 w-24 rounded-2xl object-cover border border-white/40"
                />
              ) : (
                <div className="h-24 w-24 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold border border-white/40">
                  {getInitials(formData.name)}
                </div>
              )}

              {isEditing && (
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black/45 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <span className="text-xs font-medium">Change</span>
                  <input
                    id="avatar-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{user?.name || 'User'}</h1>
              <p className="text-white/90">{user?.email || 'No email'}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-white/20">Member since {memberSince}</span>
                <span className="px-2.5 py-1 rounded-full bg-white/20">Theme: {theme}</span>
                <span className="px-2.5 py-1 rounded-full bg-white/20">ID: {user?.id || '-'}</span>
              </div>
            </div>
          </div>

          <div className="min-w-[200px] rounded-xl bg-white/15 p-4 border border-white/20">
            <p className="text-xs uppercase tracking-wide text-white/80">Task completion</p>
            <p className="text-3xl font-bold mt-1">{completionRate}%</p>
            <p className="text-xs text-white/85 mt-1">{stats.tasksDone} done out of {stats.tasksTotal}</p>
            <div className="mt-3 h-2 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full bg-white" style={{ width: `${completionRate}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Projects</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{statsLoading ? '--' : stats.projects}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">My tasks</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{statsLoading ? '--' : stats.tasksTotal}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">In progress</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{statsLoading ? '--' : stats.tasksInProgress}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
          <p className="mt-2 text-2xl font-semibold text-red-600 dark:text-red-400">{statsLoading ? '--' : stats.tasksOverdue}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account details</h2>
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Edit profile
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  required
                />
              ) : (
                <p className="mt-2 text-sm text-gray-900 dark:text-gray-100">{user?.name || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  required
                />
              ) : (
                <p className="mt-2 text-sm text-gray-900 dark:text-gray-100">{user?.email || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Joined on</label>
              <p className="mt-2 text-sm text-gray-900 dark:text-gray-100">{memberSince}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current theme</label>
              <p className="mt-2 text-sm text-gray-900 dark:text-gray-100 capitalize">{theme}</p>
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-blue-600 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
