import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';

const KanbanColumn = ({ id, title, tasks }) => {
  const { setNodeRef } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col h-full min-h-[500px]"
    >
      <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 capitalize flex justify-between items-center">
        {title}
        <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-0.5 px-2 rounded-full text-xs">
          {tasks.length}
        </span>
      </h3>

      <SortableContext
        id={id}
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 space-y-3">
          {tasks.map((task) => (
            <SortableTask key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

const SortableTask = ({ task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing border border-gray-200 dark:border-gray-700 hover:border-primary/20"
    >
      <Link
        to={`/tasks/${task.id}`}
        className="block font-medium text-gray-900 dark:text-gray-100 mb-1 hover:underline"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {task.title}
      </Link>
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
        <span
          className={`px-2 py-1 rounded ${
            task.priority === 'critical'
              ? 'bg-red-100 text-red-800'
              : task.priority === 'high'
              ? 'bg-orange-100 text-orange-800'
              : task.priority === 'medium'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {task.priority}
        </span>
        {task.due_date && <span>{new Date(task.due_date).toLocaleDateString()}</span>}
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300">
            {task.assigned_user?.name?.charAt(0) || '?'}
          </div>
          {task.assigned_user?.name?.split(' ')[0] || 'Non assigne'}
        </span>
      </div>
    </div>
  );
};

export const KanbanBoard = ({ tasks, onStatusChange }) => {
  const [activeId, setActiveId] = React.useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === 'todo'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    done: tasks.filter((t) => t.status === 'done'),
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTask = active.data.current?.task;
    let newStatus = null;

    if (['todo', 'in_progress', 'done'].includes(over.id)) {
      newStatus = over.id;
    } else {
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (activeTask && newStatus && activeTask.status !== newStatus) {
      onStatusChange(activeTask.id, newStatus);
    }
  };

  const activeTask = tasks.find((t) => t.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['todo', 'in_progress', 'done'].map((status) => (
          <KanbanColumn
            key={status}
            id={status}
            title={status === 'todo' ? 'A faire' : status === 'in_progress' ? 'En cours' : 'Termine'}
            tasks={tasksByStatus[status]}
          />
        ))}
      </div>

      <DragOverlay>
        {activeId && activeTask ? (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border-2 border-primary rotate-2 cursor-grabbing opacity-90">
            <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">{activeTask.title}</div>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{activeTask.priority}</span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
