import React, { useState, useEffect } from 'react';
import { Course, Asset } from './courseBuilderTypes';
import { FolderKanban, Upload, FileText, Video, Music, Image as ImageIcon, Trash2, ExternalLink, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { cbFetch } from './cbApi';

interface AssetManagerProps {
  course: Course;
}

export function AssetManager({ course }: AssetManagerProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [name, setName] = useState('');
  const [fileType, setFileType] = useState<'video' | 'audio' | 'image' | 'pdf' | 'document' | 'download'>('pdf');
  const [url, setUrl] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setConfirmDeleteId(null);
    setNotice(null);
    void fetchAssets();
  }, [course.id]);

  const fetchAssets = async () => {
    try {
      const res = await cbFetch(`/api/courses/${course.id}/assets`);
      if (!res.ok) throw new Error('Failed to load course assets.');
      const data = await res.json();
      setAssets(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setNotice({ type: 'error', message: e?.message || 'Unable to load assets.' });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    setNotice(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await cbFetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'File upload failed.');
      }
      setUrl(data.url);
      if (!name.trim()) setName(file.name);
      const sizeKb = file.size / 1024;
      setFileSize(sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(sizeKb))} KB`);
      setNotice({ type: 'success', message: `Uploaded "${file.name}". Click Add Asset to attach it to this course.` });
    } catch (err: any) {
      setNotice({ type: 'error', message: err?.message || 'Unable to upload file.' });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    if (!name.trim()) {
      setNotice({ type: 'error', message: 'Enter an asset name.' });
      return;
    }
    if (!url.trim()) {
      setNotice({ type: 'error', message: 'Upload a file or enter a valid asset URL.' });
      return;
    }
    try {
      const res = await cbFetch(`/api/courses/${course.id}/assets`, {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          fileType,
          url: url.trim(),
          fileSize: fileSize.trim() || 'External'
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save asset.');
      }
      setName('');
      setUrl('');
      setFileSize('');
      setNotice({ type: 'success', message: 'Asset attached to course.' });
      await fetchAssets();
    } catch (e: any) {
      setNotice({ type: 'error', message: e?.message || 'Unable to save asset.' });
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      const res = await cbFetch(`/api/assets/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete asset.');
      setConfirmDeleteId(null);
      setNotice({ type: 'success', message: 'Asset removed.' });
      await fetchAssets();
    } catch (e: any) {
      setNotice({ type: 'error', message: e?.message || 'Unable to delete asset.' });
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5 text-blue-600" />;
      case 'audio': return <Music className="w-5 h-5 text-purple-600" />;
      case 'image': return <ImageIcon className="w-5 h-5 text-emerald-600" />;
      default: return <FileText className="w-5 h-5 text-rose-600" />;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Asset Manager: {course.title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Organize videos, audio files, PDFs, spreadsheets, and exercises for this course.</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <FolderKanban className="w-6 h-6" />
        </div>
      </div>

      {notice && (
        <div
          role={notice.type === 'error' ? 'alert' : 'status'}
          className={`px-4 py-3 rounded-xl border text-xs flex items-center space-x-2 ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notice.message}</span>
        </div>
      )}

      {/* Upload Asset Form */}
      <form onSubmit={handleAddAsset} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <Upload className="w-4 h-4 text-indigo-600" />
          <span>Add New Asset</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Name</label>
            <input
              type="text"
              placeholder="e.g. Treasury_Spreadsheet_Template.xlsx"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">File Type</label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800"
            >
              <option value="pdf">PDF Document</option>
              <option value="document">Spreadsheet / Doc</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="image">Image</option>
              <option value="download">Downloadable Archive</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">File Size</label>
            <input
              type="text"
              placeholder="e.g. 3.4 MB"
              value={fileSize}
              onChange={(e) => setFileSize(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">File URL / Source Link</label>
            <input
              type="text"
              placeholder="https://... or /uploads/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 font-mono"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Or Upload Local File</label>
            <label className="flex items-center justify-center gap-2 w-full bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-700 cursor-pointer transition-colors">
              {uploadingFile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span>Choose file to upload</span>
                </>
              )}
              <input type="file" onChange={handleFileUpload} disabled={uploadingFile} className="sr-only" />
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={uploadingFile}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-md transition-all disabled:opacity-50"
          >
            Add Asset
          </button>
        </div>
      </form>

      {/* Asset List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 text-base">Course Assets ({assets.length})</h3>
        </div>
        <div className="divide-y divide-slate-200">
          {assets.map((ast) => (
            <div key={ast.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  {getAssetIcon(ast.fileType)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900">{ast.name}</p>
                  <div className="flex items-center space-x-3 text-xs text-slate-500 mt-0.5">
                    <span className="uppercase font-medium text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">{ast.fileType}</span>
                    <span>{ast.fileSize}</span>
                    <span>Uploaded {new Date(ast.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={ast.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title="Open Asset"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                {confirmDeleteId === ast.id ? (
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => void handleDeleteAsset(ast.id)}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-semibold hover:bg-rose-700"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2 py-1 rounded-lg text-slate-600 hover:bg-slate-100 text-[11px] font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(ast.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {assets.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-xs">
              No assets attached to this course yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
