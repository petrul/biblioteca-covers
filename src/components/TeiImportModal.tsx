import React, { useState } from 'react';
import { BookMetadata, AuthorPortraitConfig, LayoutArchetypeId } from '../types';
import { parseTeiXml } from '../utils/teiParser';
import { SAMPLE_BOOKS, SampleBookItem } from '../utils/sampleTei';
import { FileCode, Upload, Sparkles, BookOpen, Check, X, AlertCircle, Braces } from 'lucide-react';

interface TeiImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: BookMetadata;
  onUpdateMetadata: (meta: BookMetadata) => void;
  onSelectSampleBook: (sample: SampleBookItem) => void;
  onOpenJsonModal?: () => void;
  onAiRecommendations?: (data: {
    recommendedLayoutId?: LayoutArchetypeId;
    tagline?: string;
    genre?: string;
    palette?: any;
  }) => void;
}

export const TeiImportModal: React.FC<TeiImportModalProps> = ({
  isOpen,
  onClose,
  metadata,
  onUpdateMetadata,
  onSelectSampleBook,
  onOpenJsonModal,
  onAiRecommendations,
}) => {
  const [activeTab, setActiveTab] = useState<'fields' | 'xml' | 'samples'>('fields');
  const [rawXml, setRawXml] = useState(metadata.rawTei || '');
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleXmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawXml(e.target.value);
  };

  const handleParseXml = () => {
    if (!rawXml.trim()) return;
    const parsed = parseTeiXml(rawXml);
    onUpdateMetadata(parsed);
    setActiveTab('fields');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setRawXml(text);
        const parsed = parseTeiXml(text);
        onUpdateMetadata(parsed);
        setActiveTab('fields');
      }
    };
    reader.readAsText(file);
  };

  const runAiAnalysis = async () => {
    setAnalyzingAi(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai-analyze-tei', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teiSnippet: rawXml || metadata.rawTei || '',
          title: metadata.title,
          author: metadata.author,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'AI analysis unavailable');
      }

      const data = await res.json();
      if (data) {
        if (data.tagline && !metadata.taglineQuote) {
          onUpdateMetadata({ ...metadata, taglineQuote: data.tagline, genre: data.genre || metadata.genre });
        }
        if (onAiRecommendations) {
          onAiRecommendations({
            recommendedLayoutId: data.recommendedLayoutId,
            tagline: data.tagline,
            genre: data.genre,
            palette: data.palette,
          });
        }
      }
    } catch (err: any) {
      console.warn('AI Analysis notice:', err);
      setAiError(err.message || 'AI analysis unavailable.');
    } finally {
      setAnalyzingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FAF8F5] border border-stone-300 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-amber-700" />
            <div>
              <h2 className="text-base font-serif font-bold text-stone-900">
                TEI XML Document & Metadata
              </h2>
              <p className="text-xs text-stone-500">
                Text Encoding Initiative header parser & bibliographic extractor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('fields')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'fields'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Extracted Bibliographic Fields
            </button>
            <button
              onClick={() => setActiveTab('xml')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'xml'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Raw TEI XML Editor
            </button>
            <button
              onClick={() => setActiveTab('samples')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'samples'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Historical Sample Classics
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onOpenJsonModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenJsonModal();
                }}
                className="px-2.5 py-1 text-xs text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-md flex items-center gap-1.5 transition-colors font-medium shadow-2xs"
                title="Switch to Custom JSON Book & Graphic Importer"
              >
                <Braces className="w-3.5 h-3.5 text-amber-800" />
                <span>Custom JSON</span>
              </button>
            )}

            <button
              onClick={runAiAnalysis}
              disabled={analyzingAi}
              className="px-2.5 py-1 text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{analyzingAi ? 'Analyzing...' : 'AI Literary Mood'}</span>
            </button>

            <label className="cursor-pointer px-2.5 py-1 text-xs text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 rounded-md flex items-center gap-1.5 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Import XML</span>
              <input
                type="file"
                accept=".xml,.tei,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {aiError && (
          <div className="mx-6 mt-3 p-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{aiError}</span>
          </div>
        )}

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: FORM FIELDS */}
          {activeTab === 'fields' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-stone-700 uppercase tracking-wider mb-1">
                    Book Title (teiHeader/titleStmt/title)
                  </label>
                  <input
                    type="text"
                    value={metadata.title}
                    onChange={(e) => onUpdateMetadata({ ...metadata, title: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-md focus:ring-1 focus:ring-amber-500 font-serif"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-700 uppercase tracking-wider mb-1">
                    Subtitle (title[@type='sub'])
                  </label>
                  <input
                    type="text"
                    value={metadata.subtitle || ''}
                    onChange={(e) => onUpdateMetadata({ ...metadata, subtitle: e.target.value })}
                    placeholder="e.g. Or, The Modern Prometheus"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-md focus:ring-1 focus:ring-amber-500 font-serif italic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-stone-700 uppercase tracking-wider mb-1">
                    Author (teiHeader/titleStmt/author)
                  </label>
                  <input
                    type="text"
                    value={metadata.author}
                    onChange={(e) => onUpdateMetadata({ ...metadata, author: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-md focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-700 uppercase tracking-wider mb-1">
                    Series / Imprint (seriesStmt/title)
                  </label>
                  <input
                    type="text"
                    value={metadata.series || ''}
                    onChange={(e) => onUpdateMetadata({ ...metadata, series: e.target.value })}
                    placeholder="e.g. Oxford World's Classics"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-md focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-stone-700 uppercase tracking-wider mb-1">
                    Publisher (publicationStmt/publisher)
                  </label>
                  <input
                    type="text"
                    value={metadata.publisher}
                    onChange={(e) => onUpdateMetadata({ ...metadata, publisher: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-md focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-700 uppercase tracking-wider mb-1">
                    Place of Publication (pubPlace)
                  </label>
                  <input
                    type="text"
                    value={metadata.pubPlace || ''}
                    onChange={(e) => onUpdateMetadata({ ...metadata, pubPlace: e.target.value })}
                    placeholder="e.g. London"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-md focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-700 uppercase tracking-wider mb-1">
                    Year / Date (date[@when])
                  </label>
                  <input
                    type="text"
                    value={metadata.date}
                    onChange={(e) => onUpdateMetadata({ ...metadata, date: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-md focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-stone-700 uppercase tracking-wider mb-1">
                    ISBN (idno[@type='ISBN'])
                  </label>
                  <input
                    type="text"
                    value={metadata.isbn || ''}
                    onChange={(e) => onUpdateMetadata({ ...metadata, isbn: e.target.value })}
                    placeholder="978-0-14-143947-1"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-md focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-700 uppercase tracking-wider mb-1">
                    Genre / Keywords (profileDesc/textClass)
                  </label>
                  <input
                    type="text"
                    value={metadata.genre || ''}
                    onChange={(e) => onUpdateMetadata({ ...metadata, genre: e.target.value })}
                    placeholder="e.g. Gothic Fiction, Philosophical"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-md focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-700 uppercase tracking-wider mb-1">
                  Epigraph / Cover Blurb / Quote (epigraph/quote)
                </label>
                <textarea
                  rows={2}
                  value={metadata.taglineQuote || ''}
                  onChange={(e) => onUpdateMetadata({ ...metadata, taglineQuote: e.target.value })}
                  placeholder="Evocative opening quote or blurb for the front / back cover..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-md focus:ring-1 focus:ring-amber-500 font-serif italic"
                />
              </div>
            </div>
          )}

          {/* TAB 2: RAW XML */}
          {activeTab === 'xml' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-600 font-mono">
                  Paste or edit complete &lt;TEI&gt; XML document
                </span>
                <button
                  onClick={handleParseXml}
                  className="px-3 py-1 text-xs font-medium text-white bg-amber-800 hover:bg-amber-900 rounded-md transition-colors shadow-xs"
                >
                  Parse & Extract Metadata
                </button>
              </div>

              <textarea
                rows={14}
                value={rawXml}
                onChange={handleXmlChange}
                placeholder="<TEI xmlns='http://www.tei-c.org/ns/1.0'>..."
                className="w-full p-3 text-xs bg-stone-900 text-amber-200/90 font-mono border border-stone-700 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          )}

          {/* TAB 3: SAMPLES */}
          {activeTab === 'samples' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-600 mb-2">
                Click any historical classic to load its authentic TEI XML structure and author portrait:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SAMPLE_BOOKS.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectSampleBook(item);
                      setRawXml(item.teiXml);
                      onClose();
                    }}
                    className="p-3 bg-white border border-stone-200 hover:border-amber-600 rounded-lg cursor-pointer transition-all hover:shadow-md flex items-center gap-3"
                  >
                    <img
                      src={item.portrait.url}
                      alt={item.author}
                      referrerPolicy="no-referrer"
                      className="w-12 h-14 object-cover rounded-sm border border-stone-300"
                    />
                    <div>
                      <div className="text-xs font-semibold text-stone-900">{item.name}</div>
                      <div className="text-[10px] text-stone-500 font-mono mt-0.5">Author: {item.author}</div>
                      <span className="inline-block mt-1 text-[10px] text-amber-700 font-medium">
                        Load TEI & Portrait →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-stone-200 bg-stone-50">
          <div className="text-[11px] text-stone-500 font-mono">
            {metadata.title} · {metadata.author}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
