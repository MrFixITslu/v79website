import React, { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Course, Module, Lesson } from './courseBuilderTypes';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Dashboard } from './Dashboard';
import { CourseList } from './CourseList';
import { CourseEditor } from './CourseEditor';
import { CoursePreview } from './CoursePreview';
import { ExportModal } from './ExportModal';
import { AICourseAssistantModal } from './AICourseAssistantModal';
import { AssetManager } from './AssetManager';
import { cbFetch } from './cbApi';

// This panel is the full V79 Academy Course Builder, mounted inside AdminApp
// after cookie-session authentication.
interface CourseBuilderPanelProps {
  onExit?: () => void;
}

export default function CourseBuilderPanel({ onExit }: CourseBuilderPanelProps) {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [assetCourseId, setAssetCourseId] = useState<string>('');
  const [exportingCourse, setExportingCourse] = useState<Course | null>(null);
  const [previewingCourse, setPreviewingCourse] = useState<Course | null>(null);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [selectedAppCategory, setSelectedAppCategory] = useState<string>('All Applications');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setErrorBanner(null);
      const res = await cbFetch('/api/courses');
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to load courses (HTTP ${res.status})`);
      }
      const data = await res.json();
      const courseList: Course[] = Array.isArray(data) ? data : [];
      setCourses(courseList);
      if (courseList.length > 0 && !courseList.some((c) => c.id === assetCourseId)) {
        setAssetCourseId(courseList[0].id);
      }

      // Populate real module & lesson counts for dashboard overview
      const modArrays = await Promise.all(
        courseList.map(async (c) => {
          try {
            const mRes = await cbFetch(`/api/courses/${c.id}/modules`);
            return mRes.ok ? ((await mRes.json()) as Module[]) : [];
          } catch {
            return [];
          }
        })
      );
      const allMods = modArrays.flat();
      setModules(allMods);

      const lesArrays = await Promise.all(
        allMods.map(async (m) => {
          try {
            const lRes = await cbFetch(`/api/modules/${m.id}/lessons`);
            return lRes.ok ? ((await lRes.json()) as Lesson[]) : [];
          } catch {
            return [];
          }
        })
      );
      setLessons(lesArrays.flat());
    } catch (e: any) {
      setErrorBanner(e?.message || 'Unable to load Course Builder data.');
    }
  };

  const handleCreateNewCourse = async () => {
    try {
      setErrorBanner(null);
      const res = await cbFetch('/api/courses', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New V79 Academy Course',
          shortDescription: 'Enter course short description here...',
          fullDescription: 'Enter comprehensive course overview and learning outcomes...',
          category: selectedAppCategory === 'All Applications' ? 'Fire Finance Pro (FFPRO2)' : selectedAppCategory,
          difficultyLevel: 'Intermediate',
          instructor: 'V79 Academy Lead Author',
          courseVersion: '1.0.0',
          thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
          estimatedDuration: '3.0 hours',
          prerequisites: ['Basic V79 Application Knowledge'],
          learning_objectives: ['Understand core workflows', 'Execute advanced configuration tasks'],
          status: 'Draft'
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create course.');
      }
      const created = await res.json();
      await fetchCourses();
      setSelectedCourse(created);
      setCurrentView('editor');
    } catch (e: any) {
      setErrorBanner(e?.message || 'Failed to create new course.');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      setErrorBanner(null);
      const res = await cbFetch(`/api/courses/${courseId}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete course.');
      }
      await fetchCourses();
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(null);
        setCurrentView('dashboard');
      }
    } catch (e: any) {
      setErrorBanner(e?.message || 'Failed to delete course.');
    }
  };

  if (previewingCourse) {
    return (
      <CoursePreview
        course={previewingCourse}
        onBack={() => setPreviewingCourse(null)}
      />
    );
  }

  const activeAssetCourse = courses.find((c) => c.id === assetCourseId) || courses[0] || null;

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans antialiased">
      <Sidebar
        currentView={currentView}
        setCurrentView={(v) => {
          setCurrentView(v);
          setSelectedCourse(null);
        }}
        selectedAppCategory={selectedAppCategory}
        setSelectedAppCategory={setSelectedAppCategory}
        onExit={onExit}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onNewCourse={handleCreateNewCourse}
          onOpenAiAssistant={() => setShowAiModal(true)}
          selectedAppCategory={selectedAppCategory}
        />

        {errorBanner && (
          <div className="mx-8 mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800 flex items-center justify-between gap-3" role="alert">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorBanner(null)}
              className="p-1 rounded-lg hover:bg-rose-100 text-rose-600"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <main className="flex-1">
          {currentView === 'dashboard' && (
            <Dashboard
              courses={courses}
              modules={modules}
              lessons={lessons}
              onSelectCourse={(c) => {
                setSelectedCourse(c);
                setCurrentView('editor');
              }}
              onPreviewCourse={(c) => setPreviewingCourse(c)}
              onExportCourse={(c) => setExportingCourse(c)}
              onNewCourse={handleCreateNewCourse}
              setCurrentView={setCurrentView}
            />
          )}

          {currentView === 'courses' && (
            <CourseList
              courses={courses}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedAppCategory={selectedAppCategory}
              onSelectCourse={(c) => {
                setSelectedCourse(c);
                setCurrentView('editor');
              }}
              onPreviewCourse={(c) => setPreviewingCourse(c)}
              onExportCourse={(c) => setExportingCourse(c)}
              onDeleteCourse={handleDeleteCourse}
              onNewCourse={handleCreateNewCourse}
            />
          )}

          {currentView === 'editor' && selectedCourse && (
            <CourseEditor
              course={selectedCourse}
              onBack={() => {
                setSelectedCourse(null);
                setCurrentView('courses');
              }}
              onUpdateCourse={(updated) => {
                setSelectedCourse(updated);
                fetchCourses();
              }}
              onExportCourse={(c) => setExportingCourse(c)}
            />
          )}

          {currentView === 'assets' && (
            <div className="p-8 space-y-6 max-w-5xl mx-auto">
              {activeAssetCourse ? (
                <>
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                    <div>
                      <h2 className="font-bold text-slate-900 text-base">Course Assets</h2>
                      <p className="text-xs text-slate-500">Select a course to upload or manage its downloadable materials.</p>
                    </div>
                    <select
                      aria-label="Select course for asset management"
                      value={activeAssetCourse.id}
                      onChange={(e) => setAssetCourseId(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <AssetManager course={activeAssetCourse} />
                </>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
                  <h3 className="font-bold text-slate-800 text-base">No Courses Available</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Create a course first to attach and organize media assets.
                  </p>
                  <button
                    onClick={handleCreateNewCourse}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-md transition-all inline-block"
                  >
                    Create First Course
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {exportingCourse && (
        <ExportModal
          course={exportingCourse}
          onClose={() => setExportingCourse(null)}
        />
      )}

      {showAiModal && (
        <AICourseAssistantModal
          onClose={() => setShowAiModal(false)}
          onCourseCreated={() => {
            fetchCourses();
            setCurrentView('courses');
          }}
        />
      )}
    </div>
  );
}
