"use client";

import React, { useState, useEffect, useSyncExternalStore, Fragment, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Edit, Trash2, Plus, X, ChevronDown, Save, ArrowLeft, ArrowRight, 
  Image as ImageIcon, Search, AlertCircle, Loader2, ArrowUp, ArrowDown, Upload, Eye, FileText, RefreshCw, Link as LinkIcon 
} from "lucide-react";
import Image from "next/image";
import SafeImage from "@/app/components/SafeImage";

export default function AdminPage() {
  const isAuthenticated = useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined") return () => {};
      const handler = () => callback();
      window.addEventListener("auth-change", handler);
      window.addEventListener("storage", handler);
      return () => {
        window.removeEventListener("auth-change", handler);
        window.removeEventListener("storage", handler);
      };
    },
    () => localStorage.getItem("admin_auth") === "true",
    () => false
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("clients");

  // Load active tab from localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem("admin_active_tab");
    if (savedTab) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(savedTab);
    }
  }, []);

  // Save active tab to localStorage
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    localStorage.setItem("admin_active_tab", tabId);
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "admin123") {
      localStorage.setItem("admin_auth", "true");
      window.dispatchEvent(new Event("auth-change"));
      setError("");
    } else {
      setError("Неверный логин или пароль");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    window.dispatchEvent(new Event("auth-change"));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
        >
          <h1 className="text-2xl font-bold text-brand-brown mb-6 text-center">Вход в админ-панель</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-transparent outline-none"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-brand-brown text-white py-2 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Войти
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: "clients", label: "Клиенты" },
    { id: "orders", label: "Заказы" },
    { id: "transactions", label: "Транзакции" },
    { id: "catalog", label: "Каталог" },
    { id: "collections", label: "Коллекции" },
    { id: "restaurants", label: "Для ресторанов" },
  ];

  return (
    <div className="min-h-screen bg-brand-beige">
      {/* Header */}
      <header className="bg-brand-brown text-brand-beige shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">One Order - Админ</h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-brand-beige text-brand-brown rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
            >
              Выйти
            </button>
          </div>
          
          {/* Tabs Navigation */}
          <div className="flex space-x-1 overflow-x-auto pb-0 hide-scrollbar mt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id ? "text-white" : "text-brand-beige/60 hover:text-brand-beige"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-beige"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "clients" && <ClientsTab />}
            {activeTab === "orders" && <OrdersTab />}
            {activeTab === "transactions" && <TransactionsTab />}
            {activeTab === "catalog" && <CatalogTab />}
            {activeTab === "collections" && <CollectionsTab />}
            {activeTab === "restaurants" && <ProjectsTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

interface Project {
  id: string;
  type: 'portfolio' | 'promo';
  title?: string;
  image?: string;
  text?: string;
  order: number;
}

interface ProjectDraft {
  id: string;
  data: Partial<Project>;
  updatedAt: number;
  isNew: boolean;
}

function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [drafts, setDrafts] = useState<ProjectDraft[]>([]);

  useEffect(() => {
    fetchProjects();
    // Load drafts
    const saved = localStorage.getItem("admin_project_drafts");
    if (saved) {
      try {
        setDrafts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse drafts", e);
      }
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (isEditing && (currentProject.title || currentProject.text)) {
      const timer = setTimeout(() => {
        saveDraft(currentProject);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentProject, isEditing]);

  const saveDraft = (project: Partial<Project>) => {
    const draftId = project.id || `draft_${Date.now()}`;
    const isNew = !project.id || project.id.startsWith("draft_");

    // Ensure we have an ID for the draft itself
    const projectWithId = { ...project, id: draftId };
    if (!project.id) {
        setCurrentProject(projectWithId);
    }

    setDrafts(prev => {
      const existingIndex = prev.findIndex(d => d.id === draftId);
      const newDraft: ProjectDraft = {
        id: draftId,
        data: projectWithId,
        updatedAt: Date.now(),
        isNew
      };
      
      let nextDrafts;
      if (existingIndex >= 0) {
        nextDrafts = [...prev];
        nextDrafts[existingIndex] = newDraft;
      } else {
        nextDrafts = [newDraft, ...prev];
      }
      
      localStorage.setItem("admin_project_drafts", JSON.stringify(nextDrafts));
      return nextDrafts;
    });
  };

  const deleteDraft = (id: string) => {
    setDrafts(prev => {
      const next = prev.filter(d => d.id !== id);
      localStorage.setItem("admin_project_drafts", JSON.stringify(next));
      return next;
    });
  };

  const resumeDraft = (draft: ProjectDraft) => {
    setCurrentProject(draft.data);
    setIsEditing(true);
  };

  const moveProject = async (index: number, direction: 'left' | 'right') => {
    if (searchQuery) return;
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === projects.length - 1) return;

    const newProjects = [...projects];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    
    // Swap
    [newProjects[index], newProjects[targetIndex]] = [newProjects[targetIndex], newProjects[index]];
    
    // Update orders
    newProjects.forEach((p, idx) => p.order = idx);
    
    setProjects(newProjects);

    try {
      await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProjects)
      });
    } catch (error) {
      console.error('Failed to save order', error);
      fetchProjects();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentProject(prev => ({ ...prev, image: data.url }));
      } else {
        const data = await response.json().catch(() => ({}));
        alert(data.error || "Ошибка при загрузке файла");
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert("Ошибка при загрузке файла: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.sort((a: Project, b: Project) => a.order - b.order));
      }
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот элемент?")) return;
    try {
      const response = await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
      if (response.ok) {
        setProjects(projects.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete project", error);
    }
  };

  const handleSave = async () => {
    if (!currentProject.type) {
      alert("Выберите тип элемента");
      return;
    }

    if (currentProject.type === 'portfolio' && !currentProject.title) {
      alert("Укажите название проекта");
      return;
    }

    if (currentProject.type === 'promo' && !currentProject.text) {
      alert("Укажите текст предложения");
      return;
    }

    const isDraft = currentProject.id?.startsWith("draft_");
    const method = (currentProject.id && !isDraft) ? "PUT" : "POST";
    
    const payload = { ...currentProject };
    if (isDraft) {
      delete payload.id;
    }

    try {
      const response = await fetch("/api/projects", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (currentProject.id) {
          deleteDraft(currentProject.id);
        }
        fetchProjects();
        setIsEditing(false);
        setCurrentProject({});
      } else {
        alert("Ошибка при сохранении");
      }
    } catch (error) {
      console.error("Failed to save project", error);
    }
  };

  const filteredProjects = projects.filter(p => 
    (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.text && p.text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl mx-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsEditing(false)} 
              className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-brand-brown">
                {currentProject.id ? "Редактирование" : "Новый элемент"}
              </h2>
              {currentProject.id?.startsWith('draft_') && (
                <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
                  Черновик
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-brand-brown text-white rounded-xl hover:bg-opacity-90 transition-all shadow-sm"
          >
            <Save size={18} />
            Сохранить
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Тип элемента</label>
            <div className="flex gap-4 p-1 bg-gray-100 rounded-lg w-fit">
              <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-md transition-all ${currentProject.type === 'portfolio' ? 'bg-white shadow-sm text-brand-brown font-medium' : 'text-gray-500 hover:text-gray-700'}`}>
                <input 
                  type="radio" 
                  name="type" 
                  value="portfolio" 
                  checked={currentProject.type === 'portfolio'}
                  onChange={() => setCurrentProject({ ...currentProject, type: 'portfolio' })}
                  className="hidden"
                />
                <span>Проект (Ресторан)</span>
              </label>
              <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-md transition-all ${currentProject.type === 'promo' ? 'bg-white shadow-sm text-brand-brown font-medium' : 'text-gray-500 hover:text-gray-700'}`}>
                <input 
                  type="radio" 
                  name="type" 
                  value="promo" 
                  checked={currentProject.type === 'promo'}
                  onChange={() => setCurrentProject({ ...currentProject, type: 'promo' })}
                  className="hidden"
                />
                <span>Спецпредложение</span>
              </label>
            </div>
          </div>

          {currentProject.type === 'portfolio' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Название</label>
                <input
                  type="text"
                  value={currentProject.title || ""}
                  onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown transition-all"
                  placeholder="Например: Клод Моне"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Изображение</label>
                <div className="space-y-3">
                  {currentProject.image && (
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                      <Image
                        src={currentProject.image}
                        alt="Предпросмотр"
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={() => setCurrentProject({ ...currentProject, image: '' })}
                        className="absolute top-2 right-2 p-1 bg-white/90 text-red-500 rounded-full shadow-sm hover:bg-red-50 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-lg hover:border-brand-brown hover:bg-brand-brown/5 transition-all text-gray-500 hover:text-brand-brown">
                      <Upload size={18} />
                      <span className="text-sm font-medium">Загрузить файл</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="hidden" 
                      />
                    </label>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="text"
                      value={currentProject.image || ""}
                      onChange={(e) => setCurrentProject({ ...currentProject, image: e.target.value })}
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown transition-all text-sm"
                      placeholder="Или вставьте прямую ссылку..."
                    />
                    <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>
            </>
          )}

          {currentProject.type === 'promo' && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Текст предложения</label>
              <textarea
                value={currentProject.text || ""}
                onChange={(e) => setCurrentProject({ ...currentProject, text: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown transition-all resize-none"
                rows={4}
                placeholder="Текст спецпредложения..."
              />
            </div>
          )}
          
           <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Порядок сортировки</label>
              <input
                type="number"
                value={currentProject.order || 0}
                onChange={(e) => setCurrentProject({ ...currentProject, order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown transition-all"
              />
              <p className="text-xs text-gray-400 mt-1">Чем меньше число, тем выше элемент в списке</p>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-brand-brown">Для ресторанов</h2>
          <p className="text-gray-500 mt-1">Управление проектами и спецпредложениями</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Поиск..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-brown w-full md:w-64"
            />
          </div>
          <button
            onClick={() => {
              setCurrentProject({ type: 'portfolio', order: projects.length });
              setIsEditing(true);
            }}
            className="flex items-center gap-2 px-5 py-2 bg-brand-brown text-white rounded-xl hover:bg-opacity-90 transition-all shadow-sm whitespace-nowrap"
          >
            <Plus size={18} />
            Добавить
          </button>
        </div>
      </div>

      {drafts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h3 className="text-amber-800 font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Несохраненные черновики
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drafts.map((draft) => (
              <div key={draft.id} className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex flex-col">
                <div className="mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1 block">
                    {draft.data.type === 'portfolio' ? 'Проект' : 'Спецпредложение'}
                  </span>
                  <h4 className="font-bold text-gray-900 truncate">
                    {draft.data.title || draft.data.text?.slice(0, 30) || "Без названия"}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(draft.updatedAt).toLocaleString('ru-RU')}
                  </p>
                </div>
                <div className="mt-auto flex gap-2 pt-3 border-t border-gray-50">
                  <button
                    onClick={() => resumeDraft(draft)}
                    className="flex-1 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
                  >
                    Продолжить
                  </button>
                  <button
                    onClick={() => deleteDraft(draft.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-brand-brown" size={32} />
            <p className="text-gray-400 text-sm">Загрузка данных...</p>
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500">Элементы не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                {project.type === 'portfolio' ? (
                  <>
                    <div className="relative aspect-video bg-gray-100 overflow-hidden">
                       {project.image ? (
                        <Image
                          src={project.image}
                          alt={project.title || "Проект"}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-400">Нет фото</div>
                       )}
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80" />
                       <div className="absolute bottom-4 left-4 right-4">
                         <h3 className="text-white font-bold text-xl drop-shadow-md truncate">{project.title}</h3>
                       </div>
                    </div>
                  </>
                ) : (
                  <div className="p-6 bg-brand-beige/10 flex-grow flex items-center justify-center border-b border-brand-brown/10 min-h-[180px]">
                    <div className="text-center">
                      <span className="text-xs font-bold uppercase tracking-widest text-brand-brown/50 block mb-2">Спецпредложение</span>
                      <p className="text-brand-brown font-medium leading-relaxed">{project.text}</p>
                    </div>
                  </div>
                )}
                
                <div className="p-4 flex justify-between items-center bg-white mt-auto border-t border-gray-50">
                  <div className="flex items-center gap-1">
                     <button
                        onClick={() => moveProject(index, 'left')}
                        disabled={!!searchQuery || index === 0}
                        className="p-1.5 text-gray-400 hover:text-brand-brown hover:bg-brand-brown/5 rounded-lg transition-colors disabled:opacity-30"
                        title="Переместить назад"
                     >
                        <ArrowLeft size={16} />
                     </button>
                     <button
                        onClick={() => moveProject(index, 'right')}
                        disabled={!!searchQuery || index === filteredProjects.length - 1}
                        className="p-1.5 text-gray-400 hover:text-brand-brown hover:bg-brand-brown/5 rounded-lg transition-colors disabled:opacity-30"
                        title="Переместить вперед"
                     >
                        <ArrowRight size={16} />
                     </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setCurrentProject(project);
                        setIsEditing(true);
                      }}
                      className="p-2 text-gray-400 hover:text-brand-brown hover:bg-brand-brown/5 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
// ... existing interfaces and components ...
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  ordersCount?: number;
  totalSpent?: number;
}

function ClientsTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to load from localStorage first for instant display
    const cachedUsers = localStorage.getItem("admin_users_cache");
    if (cachedUsers) {
      try {
        setUsers(JSON.parse(cachedUsers));
        setIsLoading(false);
      } catch (e) {
        console.error("Failed to parse cached users", e);
      }
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
          // Update cache
          localStorage.setItem("admin_users_cache", JSON.stringify(data.users));
        }
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
    const interval = setInterval(fetchUsers, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-brown"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 overflow-hidden">
      <h2 className="text-xl font-bold text-brand-brown mb-6">Список клиентов</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Почта</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Заказов</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сумма</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата регистрации</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Нет зарегистрированных пользователей
                </td>
              </tr>
            ) : (
              users.map((client, index) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" title={client.id}>
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name || "Не указано"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.ordersCount || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(client.totalSpent || 0).toLocaleString()} ₽</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(client.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity?: number;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
  address?: string;
  user?: {
    name: string;
    email: string;
  };
  customer?: {
    name: string;
    phone: string;
    email?: string;
  };
}

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Try to load from localStorage first for instant display
    const cachedOrders = localStorage.getItem("admin_orders_cache");
    if (cachedOrders) {
      try {
        setOrders(JSON.parse(cachedOrders));
        setIsLoading(false);
      } catch (e) {
        console.error("Failed to parse cached orders", e);
      }
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders");
        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders);
          // Update cache
          localStorage.setItem("admin_orders_cache", JSON.stringify(data.orders));
        }
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-brown"></div>
      </div>
    );
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Оплачен';
      case 'pending': return 'Ожидает';
      case 'processing': return 'В обработке';
      case 'cancelled': return 'Отменен';
      case 'shipped': return 'Отправлен';
      case 'delivered': return 'Доставлен';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm p-6 overflow-hidden">
        <h2 className="text-xl font-bold text-brand-brown mb-6">Транзакции</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Пользователь</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сумма</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Нет заказов
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <Fragment key={order.id}>
                    <tr 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => toggleExpand(order.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" title={order.id}>
                        #{orders.length - index}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-medium">{order.customer?.name || order.user?.name || "Неизвестный"}</span>
                          <span className="text-gray-500 text-xs">{order.customer?.email || order.user?.email}</span>
                          {order.customer?.phone && (
                            <span className="text-gray-500 text-xs">{order.customer.phone}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString('ru-RU')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {order.total.toLocaleString()} ₽
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="text-brand-brown hover:text-brand-brown/80"
                        >
                          Подробнее
                        </button>
                      </td>
                    </tr>
                    {expandedOrderId === order.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-6 py-4">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="text-sm text-gray-600"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">Состав заказа:</span>
                              <span>{order.items.length} товаров</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {order.items.slice(0, 4).map((item, idx) => (
                                <div key={idx} className="flex justify-between border-b border-gray-200 pb-2">
                                  <span>{item.name} {item.quantity ? `x${item.quantity}` : ''}</span>
                                  <span>{item.price.toLocaleString()} ₽</span>
                                </div>
                              ))}
                              {order.items.length > 4 && (
                                <div className="text-center text-gray-500 italic">
                                  + еще {order.items.length - 4} товаров...
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-brand-brown">Заказ #{selectedOrder.id.slice(0, 8)}</h3>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto hide-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Клиент</h4>
                  <p className="font-medium">{selectedOrder.customer?.name || selectedOrder.user?.name || "Неизвестный"}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.customer?.email || selectedOrder.user?.email}</p>
                  {selectedOrder.customer?.phone && (
                    <p className="text-sm text-gray-500">{selectedOrder.customer.phone}</p>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Доставка</h4>
                  <p className="text-sm">{selectedOrder.address || "Адрес не указан"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Дата и время</h4>
                  <p className="text-sm">{new Date(selectedOrder.createdAt).toLocaleString('ru-RU')}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Статус</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
              </div>

              <h4 className="font-bold text-lg mb-3">Товары</h4>
              <div className="space-y-3">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      {item.quantity && (
                        <p className="text-xs text-gray-500">Количество: {item.quantity}</p>
                      )}
                    </div>
                    <div className="font-medium text-brand-brown">
                      {item.price.toLocaleString()} ₽
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="font-bold text-lg">Итого:</span>
                <span className="font-bold text-xl text-brand-brown">{selectedOrder.total.toLocaleString()} ₽</span>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
              >
                Закрыть
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'succeeded' | 'canceled' | 'failed';
  paymentId: string;
  createdAt: string;
  type: 'payment';
}

function TransactionsTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("/api/transactions");
        if (response.ok) {
          const data = await response.json();
          setTransactions(data);
        }
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
    const interval = setInterval(fetchTransactions, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'succeeded': return 'Успешно';
      case 'pending': return 'Ожидает';
      case 'canceled': return 'Отменен';
      case 'failed': return 'Ошибка';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'canceled': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.paymentId && t.paymentId.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (dateRange.start) {
      if (new Date(t.createdAt) < new Date(dateRange.start)) return false;
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      if (new Date(t.createdAt) > endDate) return false;
    }

    return true;
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-brown"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-brand-brown">Транзакции</h2>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
           <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="ID транзакции, заказа..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-brown w-full md:w-64"
            />
          </div>
          <div className="flex gap-2">
            <input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-brown"
            />
            <span className="self-center text-gray-400">-</span>
             <input 
              type="date" 
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-brown"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Заказ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID платежа</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сумма</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Транзакции не найдены
                </td>
              </tr>
            ) : (
              filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono text-xs" title={t.id}>
                    {t.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-brown font-medium">
                    #{t.orderId.slice(0, 8)}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono text-xs">
                    {t.paymentId || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(t.createdAt).toLocaleString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {t.amount.toLocaleString()} ₽
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(t.status)}`}>
                      {getStatusLabel(t.status)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface CatalogColor {
  name: string;
  value: string;
  label: string;
  images?: string[];
  sizes?: string[];
}

interface CatalogDetails {
  material?: string;
  characteristics?: string;
  article?: string;
}

interface CatalogVariant {
  id: string;
  size?: string;
  colorName?: string;
  price?: number;
  sku?: string;
  images?: string[];
}

interface CatalogFilter {
  id: string;
  name: string;
  slug: string;
}

interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  images?: string[];
  image?: string;
  description?: string;
  filterIds?: string[];
  tags?: string[];
  sizes?: string[];
  colors?: CatalogColor[];
  details?: CatalogDetails;
  variants?: CatalogVariant[];
}

interface ProductDraft {
  id: string;
  data: Partial<CatalogProduct>;
  sectionIds: string[];
  updatedAt: number;
  isNew: boolean;
}

function CatalogTab() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [filters, setFilters] = useState<CatalogFilter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<CatalogProduct>>({});
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFilterId, setFilterFilterId] = useState("all");
  const [filterInput, setFilterInput] = useState("");
  const [editingFilterId, setEditingFilterId] = useState<string | null>(null);
  const [editingFilterName, setEditingFilterName] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [productFilterInput, setProductFilterInput] = useState("");
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [previewColorIndex, setPreviewColorIndex] = useState<number | null>(null);
  
  // Drafts state
  const [drafts, setDrafts] = useState<ProductDraft[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);

  useEffect(() => {
    fetchData();
    // Load drafts
    const saved = localStorage.getItem("admin_product_drafts");
    if (saved) {
      try {
        setDrafts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse drafts", e);
      }
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (isEditing && currentProduct.id) {
      const timer = setTimeout(() => {
        saveDraft(currentProduct, selectedSectionIds);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentProduct, isEditing, selectedSectionIds]);

  const saveDraft = (product: Partial<CatalogProduct>, sectionIds: string[]) => {
    if (!product.name && !product.price) return; // Don't save empty drafts
    
    const draftId = product.id!;
    const isNew = draftId.startsWith("draft_");

    setDrafts(prev => {
      const existingIndex = prev.findIndex(d => d.id === draftId);
      const newDraft: ProductDraft = {
        id: draftId,
        data: product,
        sectionIds,
        updatedAt: Date.now(),
        isNew
      };
      
      let nextDrafts;
      if (existingIndex >= 0) {
        nextDrafts = [...prev];
        nextDrafts[existingIndex] = newDraft;
      } else {
        nextDrafts = [newDraft, ...prev];
      }
      
      localStorage.setItem("admin_product_drafts", JSON.stringify(nextDrafts));
      return nextDrafts;
    });
  };

  const deleteDraft = (id: string) => {
    setDrafts(prev => {
      const next = prev.filter(d => d.id !== id);
      localStorage.setItem("admin_product_drafts", JSON.stringify(next));
      return next;
    });
  };

  const resumeDraft = (draft: ProductDraft) => {
    setCurrentProduct(draft.data);
    setSelectedSectionIds(draft.sectionIds || []);
    setIsEditing(true);
    setShowDrafts(false);
  };


  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, colRes, filterRes] = await Promise.all([
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/collections", { cache: "no-store" }),
        fetch("/api/filters", { cache: "no-store" })
      ]);
      if (prodRes.ok && colRes.ok && filterRes.ok) {
        const [prodData, colData, filterData] = await Promise.all([
          prodRes.json(),
          colRes.json(),
          filterRes.json()
        ]);
        setProducts(prodData);
        setCollections(colData);
        setFilters(filterData);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const normalizeProduct = (product?: Partial<CatalogProduct>): Partial<CatalogProduct> => ({
    id: product?.id,
    name: product?.name || "",
    price: product?.price || 0,
    images: product?.images || (product?.image ? [product.image] : []),
    description: product?.description || "",
    filterIds: product?.filterIds || [],
    tags: product?.tags || [],
    sizes: product?.sizes || [],
    colors: product?.colors || [],
    details: {
      material: product?.details?.material || "",
      characteristics: product?.details?.characteristics || "",
      article: product?.details?.article || ""
    },
    variants: product?.variants || []
  });

  const startCreate = () => {
    const draftId = `draft_${Date.now()}`;
    // Generate a default article (SKU)
    const randomSKU = `ART-${Math.floor(100000 + Math.random() * 900000)}`;
    const newProduct = normalizeProduct();
    newProduct.details = { ...newProduct.details, article: randomSKU };
    
    setCurrentProduct({ ...newProduct, id: draftId });
    setSelectedSectionIds([]);
    setPreviewImageIndex(0);
    setPreviewColorIndex(null);
    setIsEditing(true);
  };

  const startEdit = (product: CatalogProduct) => {
    setCurrentProduct(normalizeProduct(product));
    const sectionIds = collections.flatMap(c =>
      c.sections.filter(s => s.productIds.includes(product.id)).map(s => s.id)
    );
    setSelectedSectionIds(sectionIds);
    setPreviewImageIndex(0);
    setPreviewColorIndex(null);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить товар?")) return;
    try {
      const response = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      if (response.ok) {
        const updatedCollections = collections.map(c => ({
          ...c,
          sections: c.sections.map(s => ({
            ...s,
            productIds: s.productIds.filter(pid => pid !== id)
          }))
        }));
        for (const collection of updatedCollections) {
          const original = collections.find(c => c.id === collection.id);
          if (original && JSON.stringify(original.sections) !== JSON.stringify(collection.sections)) {
            await fetch("/api/collections", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(collection)
            });
          }
        }
        setCollections(updatedCollections);
        setProducts(products.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete product", error);
    }
  };

  const updateCollectionsForProduct = async (productId: string, sectionIds: string[]) => {
    const updatedCollections = collections.map(c => ({
      ...c,
      sections: c.sections.map(s => {
        const productIds = s.productIds || [];
        const shouldInclude = sectionIds.includes(s.id);
        const hasProduct = productIds.includes(productId);
        
        if (shouldInclude && !hasProduct) {
          return { ...s, productIds: [...productIds, productId] };
        }
        if (!shouldInclude && hasProduct) {
          return { ...s, productIds: productIds.filter(pid => pid !== productId) };
        }
        return s;
      })
    }));

    for (const collection of updatedCollections) {
      const original = collections.find(c => c.id === collection.id);
      if (original && JSON.stringify(original.sections) !== JSON.stringify(collection.sections)) {
        try {
          const response = await fetch("/api/collections", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(collection)
          });
          if (!response.ok) {
            console.error(`Failed to update collection ${collection.id}: ${response.statusText}`);
          }
        } catch (error) {
          console.error(`Error updating collection ${collection.id}:`, error);
        }
      }
    }
    setCollections(updatedCollections);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          newImages.push(data.url);
        } else {
          const data = await response.json().catch(() => ({}));
          console.error('Failed to upload file:', data.error);
          alert(data.error || "Ошибка при загрузке файла");
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert("Ошибка при загрузке файла: " + (error instanceof Error ? error.message : String(error)));
      }
    }

    if (newImages.length > 0) {
      setCurrentProduct(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newImages]
      }));
    }
  };

  const handleSave = async () => {
    if (!currentProduct.name) {
      alert("Укажите название товара");
      return;
    }
    if (!currentProduct.price && currentProduct.price !== 0) {
      alert("Укажите цену");
      return;
    }

    const isDraft = currentProduct.id?.startsWith("draft_");
    const method = (currentProduct.id && !isDraft) ? "PUT" : "POST";
    
    // Clean up payload
    const payload: Partial<CatalogProduct> = {
      ...currentProduct,
      price: Number(currentProduct.price || 0),
      images: (currentProduct.images || []).filter(Boolean),
      filterIds: currentProduct.filterIds || [],
      tags: currentProduct.tags || [],
      sizes: currentProduct.sizes || [],
      colors: currentProduct.colors || [],
      details: currentProduct.details || {},
      variants: currentProduct.variants || []
    };

    // Remove draft ID for new products
    if (isDraft) {
      delete payload.id;
    }

    try {
      const response = await fetch("/api/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const saved = await response.json();
        await updateCollectionsForProduct(saved.id, selectedSectionIds);
        
        // Remove draft
        if (currentProduct.id) {
          deleteDraft(currentProduct.id);
        }

        await fetchData(); // Refresh all data to ensure consistency
        setIsEditing(false);
        setCurrentProduct({});
        setSelectedSectionIds([]);
      } else {
        alert("Ошибка при сохранении");
      }
    } catch (error) {
      console.error("Failed to save product", error);
    }
  };

  const addFilter = async () => {
    const value = filterInput.trim();
    if (!value) return;
    try {
      const response = await fetch("/api/filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: value })
      });
      if (response.ok) {
        const created = await response.json();
        setFilters(prev => [...prev, created]);
        setFilterInput("");
      }
    } catch (error) {
      console.error("Failed to create filter", error);
    }
  };

  const startEditFilter = (filter: CatalogFilter) => {
    setEditingFilterId(filter.id);
    setEditingFilterName(filter.name);
  };

  const saveFilterEdit = async () => {
    if (!editingFilterId) return;
    const value = editingFilterName.trim();
    if (!value) return;
    try {
      const response = await fetch("/api/filters", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingFilterId, name: value })
      });
      if (response.ok) {
        const updated = await response.json();
        setFilters(prev => prev.map(filter => filter.id === updated.id ? updated : filter));
        setEditingFilterId(null);
        setEditingFilterName("");
      }
    } catch (error) {
      console.error("Failed to update filter", error);
    }
  };

  const cancelFilterEdit = () => {
    setEditingFilterId(null);
    setEditingFilterName("");
  };

  const deleteFilter = async (id: string) => {
    if (!confirm("Удалить фильтр?")) return;
    try {
      const response = await fetch(`/api/filters?id=${id}`, { method: "DELETE" });
      if (response.ok) {
        setFilters(prev => prev.filter(filter => filter.id !== id));
        setProducts(prev => prev.map(product => ({
          ...product,
          filterIds: (product.filterIds || []).filter(filterId => filterId !== id)
        })));
        setCurrentProduct(prev => ({
          ...prev,
          filterIds: (prev.filterIds || []).filter(filterId => filterId !== id)
        }));
      }
    } catch (error) {
      console.error("Failed to delete filter", error);
    }
  };

  const addTag = () => {
    const value = tagInput.trim();
    if (!value) return;
    setCurrentProduct(prev => ({
      ...prev,
      tags: [...(prev.tags || []), value]
    }));
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setCurrentProduct(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tag)
    }));
  };

  const toggleProductFilter = (filterId: string) => {
    setCurrentProduct(prev => {
      const selected = prev.filterIds || [];
      return {
        ...prev,
        filterIds: selected.includes(filterId)
          ? selected.filter(id => id !== filterId)
          : [...selected, filterId]
      };
    });
  };

  const addProductFilter = async () => {
    const value = productFilterInput.trim();
    if (!value) return;
    
    // Check if filter already exists
    const existing = filters.find(f => f.name.toLowerCase() === value.toLowerCase());
    if (existing) {
      if (!(currentProduct.filterIds || []).includes(existing.id)) {
        toggleProductFilter(existing.id);
      }
      setProductFilterInput("");
      return;
    }

    try {
      const response = await fetch("/api/filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: value })
      });
      if (response.ok) {
        const created = await response.json();
        setFilters(prev => [...prev, created]);
        toggleProductFilter(created.id);
        setProductFilterInput("");
      }
    } catch (error) {
      console.error("Failed to create filter", error);
    }
  };

  const addSize = () => {
    const value = sizeInput.trim();
    if (!value) return;
    if ((currentProduct.sizes || []).includes(value)) {
      setSizeInput(""); // Clear input if duplicate
      return;
    }
    setCurrentProduct(prev => ({
      ...prev,
      sizes: [...(prev.sizes || []), value]
    }));
    setSizeInput("");
  };

  const removeSize = (size: string) => {
    setCurrentProduct(prev => ({
      ...prev,
      sizes: (prev.sizes || []).filter(s => s !== size)
    }));
  };

  const addImage = () => {
    const value = imageInput.trim();
    if (!value) return;
    setCurrentProduct(prev => ({
      ...prev,
      images: [...(prev.images || []), value]
    }));
    setImageInput("");
  };

  const removeImage = (index: number) => {
    setCurrentProduct(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const moveImage = (index: number, direction: number) => {
    setCurrentProduct(prev => {
      const images = [...(prev.images || [])];
      const target = index + direction;
      if (target < 0 || target >= images.length) return prev;
      [images[index], images[target]] = [images[target], images[index]];
      return { ...prev, images };
    });
  };

  const handleColorFileUpload = async (files: FileList | null, colorIndex: number) => {
    if (!files || files.length === 0) return;

    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          newImages.push(data.url);
        } else {
          const data = await response.json().catch(() => ({}));
          alert(data.error || "Ошибка при загрузке файла");
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert("Ошибка при загрузке файла: " + (error instanceof Error ? error.message : String(error)));
      }
    }

    if (newImages.length > 0) {
      setCurrentProduct(prev => {
        const colors = [...(prev.colors || [])];
        const color = colors[colorIndex];
        colors[colorIndex] = { ...color, images: [...(color.images || []), ...newImages] };
        return { ...prev, colors };
      });
    }
  };

  const removeColorImage = (colorIndex: number, imageIndex: number) => {
    setCurrentProduct(prev => {
      const colors = [...(prev.colors || [])];
      const color = colors[colorIndex];
      const images = [...(color.images || [])];
      images.splice(imageIndex, 1);
      colors[colorIndex] = { ...color, images };
      return { ...prev, colors };
    });
  };

  const addColorSize = (colorIndex: number, size: string) => {
    if (!size) return;
    setCurrentProduct(prev => {
      const colors = [...(prev.colors || [])];
      const color = colors[colorIndex];
      if (!color.sizes?.includes(size)) {
        colors[colorIndex] = { ...color, sizes: [...(color.sizes || []), size] };
      }
      return { ...prev, colors };
    });
  };

  const removeColorSize = (colorIndex: number, sizeToRemove: string) => {
    setCurrentProduct(prev => {
      const colors = [...(prev.colors || [])];
      const color = colors[colorIndex];
      colors[colorIndex] = { ...color, sizes: (color.sizes || []).filter(s => s !== sizeToRemove) };
      return { ...prev, colors };
    });
  };

  const addColor = () => {
    setCurrentProduct(prev => ({
      ...prev,
      colors: [
        ...(prev.colors || []),
        { name: "white", value: "#FFFFFF", label: "Белый", images: [], sizes: [] }
      ]
    }));
  };

  const COLOR_MAP: Record<string, { name: string; value: string }> = {
    // Basic Colors
    "белый": { name: "white", value: "#FFFFFF" },
    "черный": { name: "black", value: "#000000" },
    "чёрный": { name: "black", value: "#000000" },
    
    // Gray
    "серый": { name: "gray", value: "#808080" },
    "светло-серый": { name: "light-gray", value: "#D3D3D3" },
    "светло серый": { name: "light-gray", value: "#D3D3D3" },
    "темно-серый": { name: "dark-gray", value: "#A9A9A9" },
    "тёмно-серый": { name: "dark-gray", value: "#A9A9A9" },
    "темно серый": { name: "dark-gray", value: "#A9A9A9" },
    "тёмно серый": { name: "dark-gray", value: "#A9A9A9" },

    // Blue
    "синий": { name: "blue", value: "#0000FF" },
    "светло-синий": { name: "light-blue", value: "#ADD8E6" },
    "светло синий": { name: "light-blue", value: "#ADD8E6" },
    "темно-синий": { name: "dark-blue", value: "#00008B" },
    "тёмно-синий": { name: "dark-blue", value: "#00008B" },
    "темно синий": { name: "dark-blue", value: "#00008B" },
    "тёмно синий": { name: "dark-blue", value: "#00008B" },
    "голубой": { name: "light-blue", value: "#87CEEB" },
    "светло-голубой": { name: "light-sky-blue", value: "#B0E0E6" },
    "светло голубой": { name: "light-sky-blue", value: "#B0E0E6" },
    "светло голубо": { name: "light-sky-blue", value: "#B0E0E6" },
    "сине голубой": { name: "sky-blue", value: "#87CEEB" },
    "сине-голубой": { name: "sky-blue", value: "#87CEEB" },
    "бирюзовый": { name: "turquoise", value: "#40E0D0" },

    // Red
    "красный": { name: "red", value: "#FF0000" },
    "светло-красный": { name: "light-red", value: "#FFCCCB" },
    "светло красный": { name: "light-red", value: "#FFCCCB" },
    "темно-красный": { name: "dark-red", value: "#8B0000" },
    "тёмно-красный": { name: "dark-red", value: "#8B0000" },
    "темно красный": { name: "dark-red", value: "#8B0000" },
    "тёмно красный": { name: "dark-red", value: "#8B0000" },
    "бордовый": { name: "maroon", value: "#800000" },

    // Green
    "зеленый": { name: "green", value: "#008000" },
    "зелёный": { name: "green", value: "#008000" },
    "светло-зеленый": { name: "light-green", value: "#90EE90" },
    "светло зеленый": { name: "light-green", value: "#90EE90" },
    "светло-зелёный": { name: "light-green", value: "#90EE90" },
    "светло зелёный": { name: "light-green", value: "#90EE90" },
    "темно-зеленый": { name: "dark-green", value: "#006400" },
    "тёмно-зеленый": { name: "dark-green", value: "#006400" },
    "темно зеленый": { name: "dark-green", value: "#006400" },
    "тёмно зеленый": { name: "dark-green", value: "#006400" },
    "салатовый": { name: "lime", value: "#00FF00" },
    "мятный": { name: "mint", value: "#98FF98" },
    "оливковый": { name: "olive", value: "#808000" },
    "хаки": { name: "khaki", value: "#F0E68C" },

    // Yellow
    "желтый": { name: "yellow", value: "#FFFF00" },
    "жёлтый": { name: "yellow", value: "#FFFF00" },
    "светло-желтый": { name: "light-yellow", value: "#FFFFE0" },
    "светло желтый": { name: "light-yellow", value: "#FFFFE0" },
    "светло-жёлтый": { name: "light-yellow", value: "#FFFFE0" },
    "светло жёлтый": { name: "light-yellow", value: "#FFFFE0" },
    "темно-желтый": { name: "dark-yellow", value: "#FFCC00" },
    "темно желтый": { name: "dark-yellow", value: "#FFCC00" },
    "горчичный": { name: "mustard", value: "#FFDB58" },

    // Orange
    "оранжевый": { name: "orange", value: "#FFA500" },
    "светло-оранжевый": { name: "light-orange", value: "#FFD580" },
    "светло оранжевый": { name: "light-orange", value: "#FFD580" },
    "светло оранжевы": { name: "light-orange", value: "#FFD580" },
    "темно-оранжевый": { name: "dark-orange", value: "#FF8C00" },
    "тёмно-оранжевый": { name: "dark-orange", value: "#FF8C00" },
    "темно оранжевый": { name: "dark-orange", value: "#FF8C00" },
    "тёмно оранжевый": { name: "dark-orange", value: "#FF8C00" },

    // Brown
    "коричневый": { name: "brown", value: "#8B4513" },
    "светло-коричневый": { name: "light-brown", value: "#D2B48C" },
    "светло коричневый": { name: "light-brown", value: "#D2B48C" },
    "темно-коричневый": { name: "dark-brown", value: "#654321" },
    "тёмно-коричневый": { name: "dark-brown", value: "#654321" },
    "темно коричневый": { name: "dark-brown", value: "#654321" },
    "тёмно коричневый": { name: "dark-brown", value: "#654321" },
    "шоколадный": { name: "chocolate", value: "#D2691E" },

    // Beige
    "бежевый": { name: "beige", value: "#F5F5DC" },
    "светло-бежевый": { name: "light-beige", value: "#FAF0E6" },
    "светло бежевый": { name: "light-beige", value: "#FAF0E6" },
    "темно-бежевый": { name: "dark-beige", value: "#9F8C76" },
    "темно бежевый": { name: "dark-beige", value: "#9F8C76" },

    // Pink
    "розовый": { name: "pink", value: "#FFC0CB" },
    "светло-розовый": { name: "light-pink", value: "#FFB6C1" },
    "светло розовый": { name: "light-pink", value: "#FFB6C1" },
    "темно-розовый": { name: "dark-pink", value: "#C71585" },
    "тёмно-розовый": { name: "dark-pink", value: "#C71585" },
    "темно розовый": { name: "dark-pink", value: "#C71585" },
    "тёмно розовый": { name: "dark-pink", value: "#C71585" },
    "малиновый": { name: "crimson", value: "#DC143C" },
    "фуксия": { name: "fuchsia", value: "#FF00FF" },

    // Purple
    "фиолетовый": { name: "purple", value: "#800080" },
    "светло-фиолетовый": { name: "light-purple", value: "#E6E6FA" },
    "светло фиолетовый": { name: "light-purple", value: "#E6E6FA" },
    "сиреневый": { name: "lilac", value: "#C8A2C8" },
    "темно-фиолетовый": { name: "dark-purple", value: "#301934" },
    "тёмно-фиолетовый": { name: "dark-purple", value: "#301934" },
    "темно фиолетовый": { name: "dark-purple", value: "#301934" },
    "тёмно фиолетовый": { name: "dark-purple", value: "#301934" },
  };

  const updateColor = (index: number, patch: Partial<CatalogColor>) => {
    setCurrentProduct(prev => {
      const colors = [...(prev.colors || [])];
      const oldColor = colors[index];
      colors[index] = { ...colors[index], ...patch };
      
      // If name changed (e.g. from "white" to "black"), update variants that reference it
      let variants = prev.variants;
      if (patch.name && oldColor.name && patch.name !== oldColor.name) {
         variants = (variants || []).map(v => 
            v.colorName === oldColor.name ? { ...v, colorName: patch.name! } : v
         );
      }

      return { ...prev, colors, variants };
    });
  };

  const removeColor = (index: number) => {
    setCurrentProduct(prev => ({
      ...prev,
      colors: (prev.colors || []).filter((_, i) => i !== index)
    }));
  };

  const addVariant = () => {
    const id = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setCurrentProduct(prev => ({
      ...prev,
      variants: [
        ...(prev.variants || []),
        {
          id,
          size: prev.sizes?.[0] || "",
          colorName: prev.colors?.[0]?.name || "",
          price: prev.price || 0
        }
      ]
    }));
  };

  const updateVariant = (index: number, patch: Partial<CatalogVariant>) => {
    setCurrentProduct(prev => {
      const variants = [...(prev.variants || [])];
      variants[index] = { ...variants[index], ...patch };
      return { ...prev, variants };
    });
  };

  const removeVariant = (index: number) => {
    setCurrentProduct(prev => ({
      ...prev,
      variants: (prev.variants || []).filter((_, i) => i !== index)
    }));
  };

  const filterOptions = [{ id: "all", name: "Все" }, ...filters];
  const filterNameById = new Map(filters.map(filter => [filter.id, filter.name]));
  const filteredProducts = products.filter(p => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchLower) || 
                          (p.details?.article || "").toLowerCase().includes(searchLower) ||
                          (p.tags || []).some(tag => tag.toLowerCase().includes(searchLower));
    const matchesFilter = filterFilterId === "all" || (p.filterIds || []).includes(filterFilterId);
    return matchesSearch && matchesFilter;
  });

  if (isEditing) {
    const colors = currentProduct.colors || [];
    const sizes = currentProduct.sizes || [];
    const variants = currentProduct.variants || [];
    const details = currentProduct.details || {};
    const previewFilters = (currentProduct.filterIds || [])
      .map(filterId => filterNameById.get(filterId))
      .filter((label): label is string => Boolean(label));
    
    return (
      <div className="bg-gray-50 min-h-screen pb-20 -m-6"> {/* Expanded to full screen overlay feel */}
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsEditing(false)} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {currentProduct.id && !currentProduct.id.startsWith("draft_") ? "Редактирование товара" : "Новый товар"}
              </h2>
              <p className="text-sm text-gray-500">
                {currentProduct.id?.startsWith("draft_") ? "Черновик" : "Заполните информацию о товаре"}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-brand-brown text-white rounded-lg hover:bg-opacity-90 transition-all shadow-sm font-medium"
            >
              <Save size={18} />
              Сохранить
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN - MAIN CONTENT */}
          <div className="lg:col-span-8 space-y-6">
             
            {/* Card 1: Basic Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-50">Основная информация</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Название товара</label>
                  <input
                    value={currentProduct.name || ""}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown transition-all"
                    placeholder="Например: Поварской китель Chef Basic"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Цена (₽)</label>
                  <input
                    type="number"
                    value={currentProduct.price === 0 ? "" : currentProduct.price}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, price: e.target.value === "" ? 0 : Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown transition-all"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Артикул (SKU)</label>
                  <div className="flex gap-2">
                    <input
                      value={currentProduct.details?.article || ""}
                      onChange={(e) => setCurrentProduct({ 
                        ...currentProduct, 
                        details: { ...currentProduct.details, article: e.target.value } 
                      })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown transition-all"
                      placeholder="Артикул производителя"
                    />
                    <button
                      onClick={() => {
                        const randomSKU = `ART-${Math.floor(100000 + Math.random() * 900000)}`;
                        setCurrentProduct({ 
                          ...currentProduct, 
                          details: { ...currentProduct.details, article: randomSKU } 
                        });
                      }}
                      className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Сгенерировать случайный артикул"
                    >
                      <RefreshCw size={20} />
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                  <textarea
                    value={currentProduct.description || ""}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown transition-all resize-none"
                    rows={4}
                    placeholder="Подробное описание товара..."
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Media */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">Фотографии по умолчанию (для каталога)</h3>
                <p className="text-sm text-gray-500">
                  Отображаются в каталоге. Используются, если у выбранного цвета нет своих фотографий.
                </p>
              </div>
              
              <div 
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-brand-brown hover:bg-brand-brown/5 transition-colors cursor-pointer mb-6"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFileUpload(e.dataTransfer.files);
                }}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
                <div className="bg-gray-100 p-3 rounded-full mb-2">
                  <Upload size={20} className="text-gray-400" />
                </div>
                <span className="text-sm font-medium text-gray-700">Загрузить фото по умолчанию</span>
                <span className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP</span>
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown transition-all"
                  placeholder="Или вставьте прямую ссылку на изображение"
                />
                <button
                  onClick={addImage}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  <Upload size={18} className="mr-2 inline" />
                  URL
                </button>
              </div>

              {currentProduct.images && currentProduct.images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {currentProduct.images.map((img, index) => (
                    <div key={`${img}-${index}`} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                      <Image src={img} alt="" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button 
                          onClick={() => moveImage(index, -1)} 
                          disabled={index === 0}
                          className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full text-white disabled:opacity-30"
                        >
                          <ArrowLeft size={14} />
                        </button>
                        <button 
                          onClick={() => removeImage(index)} 
                          className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-full text-white"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button 
                          onClick={() => moveImage(index, 1)} 
                          disabled={index === currentProduct.images!.length - 1}
                          className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full text-white disabled:opacity-30"
                        >
                          <ArrowRight size={14} />
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-2 py-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                        {index === 0 ? "Главное" : `Фото ${index + 1}`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-xs">Нет общих фото</p>
                </div>
              )}
            </div>

            {/* Card 3: Variants & Colors */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-50">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Цвета и Варианты</h3>
                  <p className="text-sm text-gray-500">Добавьте цвета, загрузите фото для каждого и выберите размеры</p>
                </div>
                <button
                  onClick={addColor}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-brown/10 text-brand-brown rounded-lg hover:bg-brand-brown/20 transition-colors font-medium text-sm"
                >
                  <Plus size={16} />
                  Добавить цвет
                </button>
              </div>
              
              <div className="space-y-6">
                {colors.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <div className="flex justify-center mb-2">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <ImageIcon size={20} className="opacity-50" />
                      </div>
                    </div>
                    <p>Нет добавленных цветов</p>
                    <button onClick={addColor} className="text-brand-brown hover:underline text-sm mt-1">Добавить первый цвет</button>
                  </div>
                ) : (
                  colors.map((color, index) => (
                    <div 
                      key={index} 
                      className={`border rounded-xl overflow-hidden shadow-sm transition-all bg-white ${previewColorIndex === index ? 'ring-2 ring-brand-brown border-brand-brown' : 'border-gray-200 hover:shadow-md'}`}
                    >
                      {/* Color Header */}
                      <div className="bg-gray-50/80 p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_auto] gap-3 w-full">
                          <input
                            value={color.label}
                            onChange={(e) => {
                              const val = e.target.value;
                              const lower = val.toLowerCase().trim();
                              const patch: Partial<CatalogColor> = { label: val };
                              const hexMatch = val.match(/^#?([0-9A-Fa-f]{6})$/);
                              if (hexMatch) {
                                const hex = `#${hexMatch[1]}`;
                                patch.value = hex;
                                patch.name = hexMatch[1].toLowerCase();
                              } else if (COLOR_MAP[lower]) {
                                patch.name = COLOR_MAP[lower].name;
                                patch.value = COLOR_MAP[lower].value;
                              } else if (val) {
                                if (/^[a-zA-Z0-9-]+$/.test(val)) {
                                  patch.name = val.toLowerCase();
                                } else {
                                  if (!color.name || color.name.startsWith('color-') || COLOR_MAP[color.label.toLowerCase()]) {
                                    patch.name = `color-${Date.now()}`;
                                  }
                                }
                              }
                              updateColor(index, patch);
                            }}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown transition-all text-sm font-medium"
                            placeholder="Название (например: Белый)"
                          />
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded-full border border-gray-200 shadow-sm flex-shrink-0"
                              style={{ backgroundColor: color.value || "#000000" }}
                            />
                            <input
                              type="text"
                              value={color.value || "#000000"}
                              onChange={(e) => {
                                let val = e.target.value;
                                if (/^[0-9A-Fa-f]{6}$/.test(val)) val = '#' + val;
                                updateColor(index, { value: val });
                              }}
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown transition-all text-xs uppercase"
                              placeholder="#000000"
                            />
                          </div>
                          <input
                             type="color"
                             value={color.value || "#000000"}
                             onChange={(e) => updateColor(index, { value: e.target.value })}
                             className="w-10 h-10 p-1 bg-white border border-gray-200 rounded-lg cursor-pointer"
                           />
                        </div>
                        
                        <div className="flex items-center gap-1 self-end sm:self-center">
                          <button 
                            onClick={() => setPreviewColorIndex(previewColorIndex === index ? null : index)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                              previewColorIndex === index 
                                ? 'bg-brand-brown text-white shadow-sm' 
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            title="Показать этот цвет в блоке предпросмотра справа"
                          >
                            <Eye size={18} />
                            {previewColorIndex === index ? 'Предпросмотр' : 'Предпросмотр'}
                          </button>
                          <button 
                            onClick={() => removeColor(index)} 
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" 
                            title="Удалить цвет"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Color Body */}
                      <div className="p-5 space-y-6">
                        {/* 1. Images Section */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                              <ImageIcon size={16} className="text-brand-brown" />
                              Фотографии цвета
                            </label>
                            <span className="text-xs text-gray-400">{(color.images || []).length} фото</span>
                          </div>
                          
                          <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
                            Загрузите фото, затем нажмите кнопку <b>&quot;Предпросмотр&quot;</b> выше, чтобы проверить вид карточки.
                          </p>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {(color.images || []).map((img, imgIdx) => (
                              <div key={imgIdx} className="relative aspect-square rounded-lg overflow-hidden group border border-gray-200 bg-gray-50">
                                <Image src={img} alt="" fill className="object-cover" />
                                <button 
                                  onClick={() => removeColorImage(index, imgIdx)}
                                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:scale-110"
                                >
                                  <X size={10} />
                                </button>
                                {/* Make first image distinct */}
                                {imgIdx === 0 && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-0.5">
                                    Главное
                                  </div>
                                )}
                              </div>
                            ))}
                            <label className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand-brown hover:bg-brand-brown/5 transition-colors bg-gray-50 hover:bg-white text-gray-400 hover:text-brand-brown group">
                              <div className="p-2 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                <Plus size={20} />
                              </div>
                              <span className="text-xs font-medium text-center px-1">Добавить фото</span>
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                multiple
                                onChange={(e) => handleColorFileUpload(e.target.files, index)}
                              />
                            </label>
                          </div>
                        </div>

                        {/* 2. Sizes Section */}
                        <div className="space-y-3 pt-4 border-t border-gray-100">
                           <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                              <FileText size={16} className="text-brand-brown" />
                              Размеры в наличии
                            </label>
                            <span className="text-xs text-gray-400">{(color.sizes || []).length} выбрано</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {sizes.length > 0 ? (
                              sizes.map(s => {
                                const isSelected = (color.sizes || []).includes(s);
                                return (
                                  <button
                                    key={s}
                                    onClick={() => isSelected ? removeColorSize(index, s) : addColorSize(index, s)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                                      isSelected 
                                        ? "bg-brand-brown text-white border-brand-brown shadow-sm" 
                                        : "bg-white text-gray-600 border-gray-200 hover:border-brand-brown hover:text-brand-brown"
                                    }`}
                                  >
                                    {s}
                                  </button>
                                );
                              })
                            ) : (
                              <div className="text-sm text-gray-400 italic flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-dashed border-gray-200 w-full justify-center">
                                <AlertCircle size={16} />
                                <span>Сначала добавьте общие размеры в блоке &quot;Характеристики и Детали&quot; ниже</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Card 4: Characteristics */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-50">Характеристики и Детали</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Материал</label>
                  <textarea
                    value={details.material || ""}
                    onChange={(e) => setCurrentProduct({ 
                      ...currentProduct, 
                      details: { ...details, material: e.target.value } 
                    })}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown transition-all resize-none"
                    placeholder="Состав ткани..."
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Дополнительные характеристики</label>
                  <textarea
                    value={details.characteristics || ""}
                    onChange={(e) => setCurrentProduct({ 
                      ...currentProduct, 
                      details: { ...details, characteristics: e.target.value } 
                    })}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown transition-all resize-none"
                    placeholder="Плотность ткани, особенности кроя и т.д."
                  />
                </div>
              </div>

              {/* Global Sizes Section moved here */}
              <div className="border-t border-gray-100 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Общая сетка размеров</label>
                
                {/* Predefined Sizes Quick Add */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Быстрый выбор стандартных размеров:</p>
                  <div className="flex flex-wrap gap-2">
                    {["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "4XL"].map(size => {
                      const isActive = sizes.includes(size);
                      return (
                        <button
                          key={size}
                          onClick={() => {
                            if (isActive) {
                              removeSize(size);
                            } else {
                              setCurrentProduct(prev => ({
                                ...prev,
                                sizes: [...(prev.sizes || []), size]
                              }));
                            }
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${
                            isActive 
                              ? "bg-brand-brown text-white border-brand-brown" 
                              : "bg-white text-gray-600 border-gray-200 hover:border-brand-brown hover:text-brand-brown"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {sizes.map(size => (
                    <span key={size} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 font-medium">
                      {size}
                      <button onClick={() => removeSize(size)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 max-w-md">
                  <input
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown transition-all"
                    placeholder="Добавить свой размер..."
                    onKeyDown={(e) => e.key === 'Enter' && addSize()}
                  />
                  <button
                    onClick={addSize}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Добавить
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">Эти размеры будут доступны для выбора в каждом цвете</p>
              </div>
            </div>

            {/* Advanced Variants (Keep for compatibility but style better) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 opacity-80 hover:opacity-100 transition-opacity">
              <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => document.getElementById('advanced-variants')?.classList.toggle('hidden')}>
                <h3 className="text-md font-bold text-gray-700">Расширенные настройки вариантов (Артикул/Цены)</h3>
                <ChevronDown size={20} className="text-gray-400" />
              </div>
              <div id="advanced-variants" className="hidden space-y-3">
                <p className="text-sm text-gray-500 mb-4">Используйте этот блок, если нужно задать уникальную цену или Артикул для конкретной комбинации размер-цвет.</p>
                {variants.map((variant, index) => (
                  <div key={variant.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_120px_140px_auto] gap-3 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <select
                      value={variant.size || ""}
                      onChange={(e) => updateVariant(index, { size: e.target.value })}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm"
                    >
                      <option value="">Размер</option>
                      {sizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                    <select
                      value={variant.colorName || ""}
                      onChange={(e) => updateVariant(index, { colorName: e.target.value })}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm"
                    >
                      <option value="">Цвет</option>
                      {colors.map(color => (
                        <option key={color.name} value={color.name}>{color.label || color.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={variant.price ?? 0}
                      onChange={(e) => updateVariant(index, { price: Number(e.target.value) })}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm"
                      placeholder="Цена"
                    />
                    <input
                      value={variant.sku || ""}
                      onChange={(e) => updateVariant(index, { sku: e.target.value })}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm"
                      placeholder="Артикул"
                    />
                    <button onClick={() => removeVariant(index)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addVariant}
                  className="w-full py-2 bg-gray-50 border border-dashed border-gray-300 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                >
                  + Добавить ручной вариант
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN - SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">
             
             {/* Preview Card - Sticky */}
             <div className="sticky top-24 space-y-6">
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                   <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Предпросмотр</h3>
                      {previewColorIndex !== null && (
                        <span className="text-xs font-medium px-2 py-1 bg-brand-brown/10 text-brand-brown rounded-lg">
                          {currentProduct.colors?.[previewColorIndex]?.label || "Цвет"}
                        </span>
                      )}
                   </div>
                   
                   <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                      <div className="aspect-[3/4] bg-gray-100 relative group overflow-hidden">
                         {(() => {
                           const activeColor = previewColorIndex !== null ? currentProduct.colors?.[previewColorIndex] : null;
                           const displayImages = (activeColor?.images?.length ? activeColor.images : (currentProduct.images?.length ? currentProduct.images : []));
                           const currentImage = displayImages[previewImageIndex] || displayImages[0];
                           
                           return displayImages.length > 0 ? (
                            <>
                               <Image 
                                  src={currentImage} 
                                  alt="" 
                                  fill
                                  sizes="(max-width: 768px) 100vw, 33vw"
                                  className="object-cover transition-transform duration-500 group-hover:scale-105" 
                               />
                               {/* Preview Controls */}
                               {displayImages.length > 1 && (
                                  <>
                                     <button 
                                        onClick={(e) => {
                                           e.stopPropagation();
                                           setPreviewImageIndex(prev => prev === 0 ? displayImages.length - 1 : prev - 1);
                                        }}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full text-gray-800 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                                     >
                                        <ArrowLeft size={14} />
                                     </button>
                                     <button 
                                        onClick={(e) => {
                                           e.stopPropagation();
                                           setPreviewImageIndex(prev => prev === displayImages.length - 1 ? 0 : prev + 1);
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full text-gray-800 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                                     >
                                        <ArrowRight size={14} />
                                     </button>
                                  </>
                               )}
                               
                               {/* Color Indicator Dots */}
                               {displayImages.length > 1 && (
                                 <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                                   {displayImages.map((_, idx) => (
                                     <div 
                                       key={idx}
                                       className={`w-1.5 h-1.5 rounded-full shadow-sm ${idx === previewImageIndex ? 'bg-white' : 'bg-white/50'}`}
                                     />
                                   ))}
                                 </div>
                               )}
                            </>
                         ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                               <ImageIcon size={48} strokeWidth={1} />
                               <span className="text-xs mt-2">Нет фото</span>
                            </div>
                         );
                         })()}

                         {/* Badges/Tags overlay */}
                         {(currentProduct.tags || []).length > 0 && (
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                               {(currentProduct.tags || []).slice(0, 3).map(tag => (
                                  <span key={tag} className="px-2 py-0.5 bg-black/70 text-white text-[10px] uppercase tracking-wide font-bold rounded">
                                     {tag}
                                  </span>
                               ))}
                            </div>
                         )}
                      </div>
                      
                      <div className="p-4 space-y-1">
                         <div className="font-medium text-gray-900 leading-tight">{currentProduct.name || "Название товара"}</div>
                         <div className="pt-2 font-bold text-lg text-gray-900">{Number(currentProduct.price || 0).toLocaleString()} ₽</div>
                         
                         {previewFilters.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-50 mt-3">
                               {previewFilters.map(filter => (
                                  <span key={filter} className="px-2 py-1 bg-gray-50 text-[10px] rounded-md text-gray-500 border border-gray-100">
                                     {filter}
                                  </span>
                               ))}
                            </div>
                         )}
                      </div>
                   </div>
                </div>

                {/* Organization Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                   <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-50">Организация</h3>
                   <div className="space-y-6">
                      
                      {/* Collections */}
                      <div>
                         <label className="font-bold text-sm text-gray-700 block mb-3">Коллекции</label>
                         <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {collections.map(collection => (
                               <div key={collection.id}>
                                  <div className="font-medium text-xs text-gray-500 uppercase mb-2 tracking-wider">{collection.title}</div>
                                  <div className="space-y-2 pl-1">
                                     {collection.sections.map(section => (
                                        <label key={section.id} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-brand-brown transition-colors">
                                           <input
                                              type="checkbox"
                                              checked={selectedSectionIds.includes(section.id)}
                                              onChange={() => {
                                                 setSelectedSectionIds(prev => 
                                                    prev.includes(section.id)
                                                       ? prev.filter(id => id !== section.id)
                                                       : [...prev, section.id]
                                                 );
                                              }}
                                              className="w-4 h-4 rounded border-gray-300 text-brand-brown focus:ring-brand-brown"
                                           />
                                           {section.title}
                                        </label>
                                     ))}
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>

                      <div className="h-px bg-gray-100" />

                      {/* Filters */}
                      <div>
                         <label className="font-bold text-sm text-gray-700 block mb-3">Фильтры</label>
                         <div className="flex gap-2 mb-3">
                            <input
                               value={productFilterInput}
                               onChange={(e) => setProductFilterInput(e.target.value)}
                               className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown transition-all text-sm"
                               placeholder="Новый фильтр"
                               onKeyDown={(e) => e.key === 'Enter' && addProductFilter()}
                            />
                            <button
                               onClick={addProductFilter}
                               className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                            >
                               +
                            </button>
                         </div>
                         {filters.length === 0 ? (
                            <div className="text-sm text-gray-400">Нет доступных фильтров</div>
                         ) : (
                            <div className="flex flex-wrap gap-2">
                               {filters.map(filter => {
                                  const isActive = (currentProduct.filterIds || []).includes(filter.id);
                                  return (
                                     <button
                                        key={filter.id}
                                        onClick={() => toggleProductFilter(filter.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                           isActive
                                              ? "bg-brand-brown text-white border-brand-brown shadow-sm"
                                              : "bg-white text-gray-600 border-gray-200 hover:border-brand-brown hover:text-brand-brown"
                                        }`}
                                     >
                                        {filter.name}
                                     </button>
                                  );
                               })}
                            </div>
                         )}
                      </div>

                      <div className="h-px bg-gray-100" />

                      {/* Tags */}
                      <div>
                         <label className="font-bold text-sm text-gray-700 block mb-3">Теги</label>
                         <div className="flex gap-2 mb-3">
                            <input
                               value={tagInput}
                               onChange={(e) => setTagInput(e.target.value)}
                               className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown transition-all text-sm"
                               placeholder="Новый тег"
                               onKeyDown={(e) => e.key === 'Enter' && addTag()}
                            />
                            <button
                               onClick={addTag}
                               className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                            >
                               +
                            </button>
                         </div>
                         <div className="flex flex-wrap gap-2">
                            {(currentProduct.tags || []).map(tag => (
                               <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium group hover:bg-gray-200 transition-colors">
                                  {tag}
                                  <button onClick={() => removeTag(tag)} className="text-gray-400 hover:text-red-500">
                                     <X size={12} />
                                  </button>
                               </span>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>

             </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-brand-brown">Каталог</h2>
            <p className="text-sm text-gray-500">Управление товарами, вариантами и коллекциями</p>
          </div>
          <div className="flex gap-2">
            {drafts.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowDrafts(!showDrafts)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-brand-brown border border-brand-brown/20 rounded-xl hover:bg-brand-brown/5 transition-all shadow-sm"
                >
                  <FileText size={18} />
                  Черновики
                  <span className="bg-brand-brown text-white text-xs px-2 py-0.5 rounded-full">
                    {drafts.length}
                  </span>
                </button>
                
                {showDrafts && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-50 bg-gray-50/50">
                      <h3 className="font-medium text-gray-700">Несохраненные товары</h3>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {drafts.map(draft => (
                        <div key={draft.id} className="p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-sm text-brand-brown truncate pr-2">
                              {draft.data.name || "Без названия"}
                            </h4>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteDraft(draft.id);
                              }}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">
                            {new Date(draft.updatedAt).toLocaleString('ru-RU')}
                          </p>
                          <button
                            onClick={() => resumeDraft(draft)}
                            className="w-full py-1.5 text-xs font-medium bg-brand-brown text-white rounded-lg hover:bg-opacity-90 transition-colors"
                          >
                            Продолжить
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={startCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-brown text-white rounded-xl hover:bg-opacity-90 transition-all shadow-sm"
            >
              <Plus size={18} />
              Новый товар
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown transition-all"
              placeholder="Поиск по названию, артикулу или тегу"
            />
          </div>
          <div className="relative">
            <select
              value={filterFilterId}
              onChange={(e) => setFilterFilterId(e.target.value)}
              className="pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown transition-all cursor-pointer appearance-none text-gray-600"
            >
              {filterOptions.map(filter => (
                <option key={filter.id} value={filter.id}>{filter.name}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
        </div>

        <div className="mt-4 bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={filterInput}
              onChange={(e) => setFilterInput(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown transition-all"
              placeholder="Новый фильтр"
            />
            <button
              onClick={addFilter}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Добавить фильтр
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {filters.map(filter => (
              <div key={filter.id} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
                {editingFilterId === filter.id ? (
                  <>
                    <input
                      value={editingFilterName}
                      onChange={(e) => setEditingFilterName(e.target.value)}
                      className="px-2 py-1 bg-white border border-gray-200 rounded-full text-sm outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown transition-all"
                    />
                    <button onClick={saveFilterEdit} className="text-gray-500 hover:text-brand-brown">
                      <Save size={14} />
                    </button>
                    <button onClick={cancelFilterEdit} className="text-gray-500 hover:text-red-500">
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-gray-700">{filter.name}</span>
                    <button onClick={() => startEditFilter(filter)} className="text-gray-400 hover:text-brand-brown">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => deleteFilter(filter.id)} className="text-gray-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            ))}
            {filters.length === 0 && (
              <div className="text-sm text-gray-400">Фильтры пока не созданы</div>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 flex justify-center">
          <Loader2 className="animate-spin text-brand-brown" size={28} />
        </div>
      ) : (
        <div className="p-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">Товары не найдены</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map(product => {
                const assignedSections = collections.flatMap(c =>
                  c.sections.filter(s => s.productIds.includes(product.id))
                );
                const productFilterLabels = (product.filterIds || [])
                  .map(filterId => filterNameById.get(filterId))
                  .filter((label): label is string => Boolean(label));
                return (
                  <motion.div
                    key={product.id}
                    layout
                    className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-[3/4] bg-gray-200 overflow-hidden relative">
                      {product.images?.[0] || product.image ? (
                        <SafeImage
                          src={product.images?.[0] || product.image || ""}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon size={28} />
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="font-medium text-brand-brown">{product.name}</div>
                      <div className="font-bold text-brand-brown">{product.price.toLocaleString()} ₽</div>
                      <div className="flex flex-wrap gap-2">
                        {(product.tags || []).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                      {productFilterLabels.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {productFilterLabels.map(label => (
                            <span key={label} className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        Размеров: {product.sizes?.length || 0} · Цветов: {product.colors?.length || 0} · Вариантов: {product.variants?.length || 0}
                      </div>
                      <div className="text-xs text-gray-400">
                        В коллекциях: {assignedSections.length}
                      </div>
                    </div>
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-400">ID: {product.id}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(product)}
                          className="p-2 text-gray-500 hover:text-brand-brown hover:bg-gray-100 rounded-lg transition-colors"
                          title="Редактировать"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Удалить"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Collections Types and Components
interface CollectionProduct {
  id: string;
  name: string;
  price: number;
  images?: string[];
  image?: string;
}

interface ProductPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: CollectionProduct[];
  onSelect: (productIds: string[]) => void;
  alreadySelectedIds: string[];
}

function ProductPickerModal({ isOpen, onClose, products, onSelect, alreadySelectedIds }: ProductPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setSelectedIds([]);
      setSearchQuery("");
    }
  }

  const filteredProducts = products.filter(p => 
    !alreadySelectedIds.includes(p.id) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    onSelect(selectedIds);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-brand-brown">Добавить товары</h3>
            <p className="text-sm text-gray-500">Выберите товары для добавления в раздел</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Поиск товаров..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-brown transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map(product => {
                const isSelected = selectedIds.includes(product.id);
                const image = product.images?.[0] || product.image || "/images/placeholder.jpg";
                
                return (
                  <div 
                    key={product.id}
                    onClick={() => toggleSelection(product.id)}
                    className={`
                      relative group cursor-pointer rounded-xl border transition-all duration-200 overflow-hidden bg-white
                      ${isSelected ? 'border-brand-brown ring-1 ring-brand-brown shadow-md' : 'border-gray-200 hover:border-brand-brown/50 hover:shadow-sm'}
                    `}
                  >
                    <div className="aspect-[3/4] relative bg-gray-100">
                       {/* Checkbox overlay */}
                       <div className={`absolute top-2 right-2 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-brand-brown border-brand-brown' : 'bg-white/80 border-gray-300'}`}>
                         {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                       </div>
                       
                       <Image 
                         src={image} 
                         alt={product.name}
                         fill
                         sizes="(max-width: 768px) 50vw, 25vw"
                         className="object-cover transition-transform duration-500 group-hover:scale-105"
                       />
                    </div>
                    <div className="p-3">
                      <div className="font-medium text-sm text-gray-900 line-clamp-2 h-10 leading-tight mb-1">{product.name}</div>
                      <div className="text-brand-brown font-bold text-sm">{product.price.toLocaleString()} ₽</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Search size={48} className="mb-4 opacity-20" />
              <p>Товары не найдены</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Выбрано: <span className="font-bold text-brand-brown">{selectedIds.length}</span>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium"
            >
              Отмена
            </button>
            <button 
              onClick={handleAdd}
              disabled={selectedIds.length === 0}
              className={`
                px-8 py-2.5 text-white rounded-xl font-medium shadow-sm transition-all flex items-center gap-2
                ${selectedIds.length > 0 ? 'bg-brand-brown hover:bg-opacity-90 hover:shadow-md' : 'bg-gray-300 cursor-not-allowed'}
              `}
            >
              <Plus size={18} />
              Добавить выбранные
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

interface CollectionSection {
  id: string;
  title: string;
  productIds: string[];
}

interface Collection {
  id: string;
  title: string;
  description: string;
  sections: CollectionSection[];
  slug: string;
  image?: string;
}

interface CollectionDraft {
  id: string;
  data: Partial<Collection>;
  updatedAt: number;
  isNew: boolean;
}

function CollectionsTab() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<CollectionProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCollection, setCurrentCollection] = useState<Partial<Collection>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [drafts, setDrafts] = useState<CollectionDraft[]>([]);

  // New state for product picker
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [pickerSectionId, setPickerSectionId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    // Load drafts
    const saved = localStorage.getItem("admin_collection_drafts");
    if (saved) {
      try {
        setDrafts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse drafts", e);
      }
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (isEditing && currentCollection.id && (currentCollection.title || currentCollection.slug || (currentCollection.sections && currentCollection.sections.length > 0))) {
      const timer = setTimeout(() => {
        saveDraft(currentCollection);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentCollection, isEditing]);

  const saveDraft = (collection: Partial<Collection>) => {
    if (!collection.id) return;
    
    const draftId = collection.id;
    const isNew = draftId.startsWith("draft_");

    setDrafts(prev => {
      const existingIndex = prev.findIndex(d => d.id === draftId);
      const newDraft: CollectionDraft = {
        id: draftId,
        data: collection,
        updatedAt: Date.now(),
        isNew
      };
      
      let nextDrafts;
      if (existingIndex >= 0) {
        nextDrafts = [...prev];
        nextDrafts[existingIndex] = newDraft;
      } else {
        nextDrafts = [newDraft, ...prev];
      }
      
      localStorage.setItem("admin_collection_drafts", JSON.stringify(nextDrafts));
      return nextDrafts;
    });
  };

  const deleteDraft = (id: string) => {
    setDrafts(prev => {
      const next = prev.filter(d => d.id !== id);
      localStorage.setItem("admin_collection_drafts", JSON.stringify(next));
      return next;
    });
  };

  const resumeDraft = (draft: CollectionDraft) => {
    setCurrentCollection(draft.data);
    setIsEditing(true);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [colRes, prodRes] = await Promise.all([
        fetch("/api/collections"),
        fetch("/api/products")
      ]);
      
      if (colRes.ok && prodRes.ok) {
        const [colData, prodData] = await Promise.all([
          colRes.json(),
          prodRes.json()
        ]);
        setCollections(colData);
        setProducts(prodData);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCollectionImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentCollection(prev => ({ ...prev, image: data.url }));
      } else {
        const data = await response.json().catch(() => ({}));
        alert(data.error || "Ошибка при загрузке файла");
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert("Ошибка при загрузке файла: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту коллекцию?")) return;
    try {
      const response = await fetch(`/api/collections?id=${id}`, { method: "DELETE" });
      if (response.ok) {
        setCollections(collections.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete collection", error);
    }
  };

  const handleSave = async () => {
    if (!currentCollection.title || !currentCollection.slug) {
      alert("Заполните обязательные поля (Название, Slug)");
      return;
    }

    const isDraft = currentCollection.id?.startsWith("draft_");
    const method = (currentCollection.id && !isDraft) ? "PUT" : "POST";
    
    const payload = { ...currentCollection };
    if (isDraft) {
      delete payload.id;
    }

    try {
      const response = await fetch("/api/collections", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (currentCollection.id) {
          deleteDraft(currentCollection.id);
        }
        fetchData(); // Refresh all data to be safe
        setIsEditing(false);
        setCurrentCollection({});
      } else {
        alert("Ошибка при сохранении");
      }
    } catch (error) {
      console.error("Failed to save collection", error);
    }
  };

  const addSection = () => {
    const newSection: CollectionSection = {
      id: Math.random().toString(36).substring(2, 9),
      title: "Новый раздел",
      productIds: []
    };
    setCurrentCollection({
      ...currentCollection,
      sections: [...(currentCollection.sections || []), newSection]
    });
  };

  const removeSection = (sectionId: string) => {
    if (!confirm("Удалить этот раздел?")) return;
    setCurrentCollection({
      ...currentCollection,
      sections: currentCollection.sections?.filter(s => s.id !== sectionId)
    });
  };

  const updateSectionTitle = (sectionId: string, newTitle: string) => {
    setCurrentCollection({
      ...currentCollection,
      sections: currentCollection.sections?.map(s => 
        s.id === sectionId ? { ...s, title: newTitle } : s
      )
    });
  };

  const addProductsToSection = (sectionId: string, productIds: string[]) => {
    setCurrentCollection({
      ...currentCollection,
      sections: currentCollection.sections?.map(s => {
        if (s.id === sectionId) {
          // Filter out duplicates
          const newIds = productIds.filter(id => !s.productIds.includes(id));
          return { ...s, productIds: [...s.productIds, ...newIds] };
        }
        return s;
      })
    });
  };

  const removeProductFromSection = (sectionId: string, productId: string) => {
    setCurrentCollection({
      ...currentCollection,
      sections: currentCollection.sections?.map(s => 
        s.id === sectionId ? { ...s, productIds: s.productIds.filter(id => id !== productId) } : s
      )
    });
  };

  const openProductPicker = (sectionId: string) => {
    setPickerSectionId(sectionId);
    setIsProductPickerOpen(true);
  };

  const handlePickerSelect = (selectedIds: string[]) => {
    if (pickerSectionId) {
      addProductsToSection(pickerSectionId, selectedIds);
    }
  };

  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    const sections = [...(currentCollection.sections || [])];
    [sections[index - 1], sections[index]] = [sections[index], sections[index - 1]];
    setCurrentCollection({ ...currentCollection, sections });
  };

  const moveSectionDown = (index: number) => {
    if (index === (currentCollection.sections?.length || 0) - 1) return;
    const sections = [...(currentCollection.sections || [])];
    [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
    setCurrentCollection({ ...currentCollection, sections });
  };

  const moveProductUp = (sectionId: string, productIndex: number) => {
    if (productIndex === 0) return;
    setCurrentCollection({
      ...currentCollection,
      sections: currentCollection.sections?.map(s => {
        if (s.id === sectionId) {
          const productIds = [...s.productIds];
          [productIds[productIndex - 1], productIds[productIndex]] = [productIds[productIndex], productIds[productIndex - 1]];
          return { ...s, productIds };
        }
        return s;
      })
    });
  };

  const moveProductDown = (sectionId: string, productIndex: number) => {
    setCurrentCollection({
      ...currentCollection,
      sections: currentCollection.sections?.map(s => {
        if (s.id === sectionId) {
          if (productIndex === s.productIds.length - 1) return s;
          const productIds = [...s.productIds];
          [productIds[productIndex], productIds[productIndex + 1]] = [productIds[productIndex + 1], productIds[productIndex]];
          return { ...s, productIds };
        }
        return s;
      })
    });
  };

  const moveCollection = async (index: number, direction: 'left' | 'right') => {
    if (searchQuery) return;
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === collections.length - 1) return;

    const newCollections = [...collections];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    
    // Swap
    [newCollections[index], newCollections[targetIndex]] = [newCollections[targetIndex], newCollections[index]];
    
    setCollections(newCollections);

    try {
      await fetch('/api/collections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCollections)
      });
    } catch (error) {
      console.error('Failed to save order', error);
      fetchData();
    }
  };

  const filteredCollections = collections.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsEditing(false)} 
              className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-brand-brown">
                {currentCollection.id ? "Редактирование коллекции" : "Новая коллекция"}
              </h2>
              <p className="text-sm text-gray-500">Заполните информацию о коллекции и добавьте товары</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-brand-brown text-white rounded-xl hover:bg-opacity-90 transition-all shadow-sm"
          >
            <Save size={18} />
            Сохранить
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
              <h3 className="font-semibold text-brand-brown flex items-center gap-2">
                <AlertCircle size={16} />
                Основная информация
              </h3>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Название</label>
                <input
                  type="text"
                  value={currentCollection.title || ""}
                  onChange={(e) => setCurrentCollection({ ...currentCollection, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown transition-all"
                  placeholder="Например: Летняя коллекция"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Слаг (URL)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 text-sm">/collections/</span>
                  <input
                    type="text"
                    value={currentCollection.slug || ""}
                    onChange={(e) => setCurrentCollection({ ...currentCollection, slug: e.target.value })}
                    className="w-full pl-24 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown transition-all text-sm"
                    placeholder="letnyaya-kollekciya"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Изображение (URL)</label>
                
                <div 
                  className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-gray-500 hover:border-brand-brown hover:bg-brand-brown/5 transition-colors cursor-pointer mb-2"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCollectionImageUpload(e.dataTransfer.files);
                  }}
                  onClick={() => document.getElementById('collection-image-upload')?.click()}
                >
                  <input 
                    type="file" 
                    id="collection-image-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleCollectionImageUpload(e.target.files)}
                  />
                  <div className="bg-gray-100 p-2 rounded-full mb-2">
                    <Upload size={20} className="text-gray-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Загрузить фото</span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={currentCollection.image || ""}
                    onChange={(e) => setCurrentCollection({ ...currentCollection, image: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown transition-all"
                    placeholder="/images/collection.jpg"
                  />
                  {currentCollection.image && (
                    <div className="mt-2 relative aspect-video rounded-lg overflow-hidden border border-gray-200 group">
                      <SafeImage src={currentCollection.image} alt="Предпросмотр" fill className="object-cover" />
                      <button 
                        onClick={() => setCurrentCollection({ ...currentCollection, image: "" })}
                        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500"
                        title="Удалить фото"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Описание</label>
                <textarea
                  value={currentCollection.description || ""}
                  onChange={(e) => setCurrentCollection({ ...currentCollection, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown transition-all resize-none"
                  rows={6}
                  placeholder="Описание коллекции..."
                />
              </div>
            </div>
          </div>

          {/* Right Column: Sections & Products */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-brand-brown flex items-center gap-2">
                Разделы и товары
                <span className="text-sm font-normal text-gray-400 ml-2">
                  ({currentCollection.sections?.length || 0} разделов)
                </span>
              </h3>
              <button
                onClick={addSection}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <Plus size={16} />
                Добавить раздел
              </button>
            </div>
            
            <div className="space-y-6">
              <AnimatePresence>
                {currentCollection.sections?.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50"
                  >
                    <p className="text-gray-400">Нет разделов. Создайте первый раздел, чтобы добавить товары.</p>
                  </motion.div>
                )}
                {currentCollection.sections?.map((section, index) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden"
                  >
                    {/* Section Header */}
                    <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-100">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="w-6 h-6 flex items-center justify-center bg-brand-brown text-white text-xs rounded-full font-bold">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                          className="bg-transparent border-b border-transparent hover:border-gray-300 focus:border-brand-brown outline-none font-semibold text-brand-brown px-1 transition-colors w-full max-w-xs"
                          placeholder="Название раздела"
                        />
                        <span className="text-xs text-gray-400 ml-2">
                          {section.productIds.length} товаров
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center mr-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
                           <button
                             onClick={() => moveSectionUp(index)}
                             disabled={index === 0}
                             className={`p-1.5 hover:bg-gray-100 transition-colors ${index === 0 ? 'text-gray-300' : 'text-gray-500'}`}
                             title="Вверх"
                           >
                             <ArrowUp size={14} />
                           </button>
                           <div className="w-px h-4 bg-gray-200"></div>
                           <button
                             onClick={() => moveSectionDown(index)}
                             disabled={index === (currentCollection.sections?.length || 0) - 1}
                             className={`p-1.5 hover:bg-gray-100 transition-colors ${index === (currentCollection.sections?.length || 0) - 1 ? 'text-gray-300' : 'text-gray-500'}`}
                             title="Вниз"
                           >
                             <ArrowDown size={14} />
                           </button>
                        </div>
                        <button
                           onClick={() => openProductPicker(section.id)}
                           className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-brand-brown hover:text-brand-brown transition-all"
                        >
                          <Plus size={14} />
                          Добавить товары
                        </button>
                        <button
                          onClick={() => removeSection(section.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Удалить раздел"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Products List */}
                    <div className="p-4">
                      {section.productIds.length > 0 ? (
                        <div className="flex flex-wrap gap-4">
                          {section.productIds.map((pid, pIndex) => {
                            const product = products.find(p => p.id === pid);
                            const image = product?.images?.[0] || product?.image || null;
                            
                            return (
                              <div key={pid} className="relative group w-32 h-32 rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-all">
                                {image ? (
                                  <SafeImage src={image} alt="" fill sizes="128px" className="object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                    <ImageIcon size={24} />
                                  </div>
                                )}
                                
                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                  <div className="flex items-center gap-2">
                                    <button 
                                      onClick={() => moveProductUp(section.id, pIndex)}
                                      disabled={pIndex === 0}
                                      className={`p-1.5 rounded-full ${pIndex === 0 ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:bg-white/20'}`}
                                      title="Влево"
                                    >
                                      <ArrowLeft size={16} />
                                    </button>
                                    <button
                                      onClick={() => removeProductFromSection(section.id, pid)}
                                      className="p-1.5 text-white hover:bg-red-500/80 rounded-full transition-colors"
                                      title="Убрать из раздела"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                    <button 
                                      onClick={() => moveProductDown(section.id, pIndex)}
                                      disabled={pIndex === section.productIds.length - 1}
                                      className={`p-1.5 rounded-full ${pIndex === section.productIds.length - 1 ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:bg-white/20'}`}
                                      title="Вправо"
                                    >
                                      <ArrowRight size={16} />
                                    </button>
                                  </div>
                                  <span className="text-xs text-white px-2 text-center line-clamp-1 max-w-full">
                                    {product?.name || "???"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div 
                          onClick={() => openProductPicker(section.id)}
                          className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-100 rounded-xl hover:border-brand-brown/30 hover:bg-brand-brown/5 transition-all cursor-pointer group"
                        >
                          <Plus size={24} className="text-gray-300 group-hover:text-brand-brown mb-2 transition-colors" />
                          <p className="text-sm text-gray-400 group-hover:text-brand-brown transition-colors">Нажмите, чтобы добавить товары</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        {/* Product Picker Modal */}
        <ProductPickerModal 
          isOpen={isProductPickerOpen}
          onClose={() => setIsProductPickerOpen(false)}
          products={products}
          onSelect={handlePickerSelect}
          alreadySelectedIds={
            pickerSectionId 
              ? currentCollection.sections?.find(s => s.id === pickerSectionId)?.productIds || [] 
              : []
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-brand-brown">Коллекции</h2>
          <p className="text-gray-500 mt-1">Управляйте подборками товаров для главной страницы</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Поиск..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-brown w-full md:w-64"
            />
          </div>
          <button
            onClick={() => {
              setCurrentCollection({ id: `draft_${Date.now()}`, sections: [] });
              setIsEditing(true);
            }}
            className="flex items-center gap-2 px-5 py-2 bg-brand-brown text-white rounded-xl hover:bg-opacity-90 transition-all shadow-sm whitespace-nowrap"
          >
            <Plus size={18} />
            Создать
          </button>
        </div>
      </div>

      {/* Drafts Section */}
      {drafts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h3 className="font-bold text-brand-brown flex items-center gap-2">
              <FileText size={18} />
              Черновики
              <span className="bg-brand-brown text-white text-xs px-2 py-0.5 rounded-full">{drafts.length}</span>
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {drafts.map(draft => (
              <div key={draft.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex-1 cursor-pointer" onClick={() => resumeDraft(draft)}>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-brand-brown">
                      {draft.data.title || "Без названия"}
                    </h4>
                    {draft.isNew && (
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Новая</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    Изменено: {new Date(draft.updatedAt).toLocaleString('ru-RU')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => resumeDraft(draft)}
                    className="p-2 text-brand-brown hover:bg-brand-brown/10 rounded-lg transition-colors"
                    title="Продолжить редактирование"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => deleteDraft(draft.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Удалить черновик"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-brand-brown" size={32} />
            <p className="text-gray-400 text-sm">Загрузка коллекций...</p>
          </div>
        </div>
      ) : filteredCollections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <ImageIcon className="text-gray-300" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">Коллекции не найдены</h3>
          <p className="text-gray-400 max-w-md mt-2">
            {searchQuery ? "По вашему запросу ничего не найдено." : "Создайте свою первую коллекцию товаров, чтобы отобразить её на сайте."}
          </p>
          {!searchQuery && (
            <button
              onClick={() => {
                setCurrentCollection({ id: `draft_${Date.now()}`, sections: [] });
                setIsEditing(true);
              }}
              className="mt-6 text-brand-brown font-medium hover:underline"
            >
              Создать первую коллекцию
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredCollections.map((collection, index) => (
              <motion.div
                key={collection.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full"
              >
                {/* Image Preview */}
                <div className="relative aspect-video w-full bg-gray-50 overflow-hidden border-b border-gray-100">
                  {collection.image ? (
                    <>
                      <SafeImage 
                        src={collection.image} 
                        alt={collection.title} 
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-300 bg-gray-50/50">
                      <ImageIcon size={32} strokeWidth={1.5} />
                    </div>
                  )}
                  
                  {/* Action Buttons (Always visible) */}
                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                    <button
                      onClick={() => {
                        setCurrentCollection(collection);
                        setIsEditing(true);
                      }}
                      className="p-2 bg-white text-gray-600 hover:text-brand-brown border border-gray-100 rounded-lg shadow-sm transition-colors"
                      title="Редактировать"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(collection.id)}
                      className="p-2 bg-white text-gray-600 hover:text-red-500 border border-gray-100 rounded-lg shadow-sm transition-colors"
                      title="Удалить"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-5 flex-grow flex flex-col">
                  <div className="mb-3">
                    <h3 className="font-bold text-lg text-brand-brown line-clamp-1 mb-1" title={collection.title}>
                      {collection.title}
                    </h3>
                    <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                      {collection.description || <span className="italic text-gray-300">Нет описания</span>}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {collection.sections.slice(0, 3).map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-50 border border-gray-100 text-gray-500 text-[10px] uppercase tracking-wide rounded font-medium">
                        {s.title} <span className="text-gray-400 ml-0.5">{s.productIds.length}</span>
                      </span>
                    ))}
                    {collection.sections.length > 3 && (
                      <span className="px-2 py-0.5 text-gray-400 text-[10px]">+ еще {collection.sections.length - 3}</span>
                    )}
                  </div>
                </div>
                
                <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                  <div className="flex items-center gap-3">
                    <span className="opacity-60">#{collection.id}</span>
                    
                    {!searchQuery && (
                      <div className="flex items-center gap-1 pl-3 border-l border-gray-200">
                        <button 
                          onClick={(e) => { e.stopPropagation(); moveCollection(index, 'left'); }}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-brand-brown disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                          title="Переместить назад"
                        >
                          <ArrowLeft size={14} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); moveCollection(index, 'right'); }}
                          disabled={index === collections.length - 1}
                          className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-brand-brown disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                          title="Переместить вперед"
                        >
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <span>{collection.sections.reduce((acc, s) => acc + s.productIds.length, 0)} товаров</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
