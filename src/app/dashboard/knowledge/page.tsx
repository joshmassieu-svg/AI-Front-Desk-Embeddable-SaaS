'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Globe,
  FileText,
  Upload,
  Plus,
  Trash2,
  Search,
  CheckCircle,
  Clock,
  Sparkles,
  RefreshCw,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { KnowledgeItem } from '@/lib/types';
import { useWebsite } from '@/context/website-context';

export default function KnowledgePage() {
  const { currentSiteId } = useWebsite();
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [activeTab, setActiveTab] = useState<'crawl' | 'file' | 'text' | 'rag-test'>('crawl');
  const [loading, setLoading] = useState(false);

  // Form states
  const [crawlUrl, setCrawlUrl] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [fileTitle, setFileTitle] = useState('');
  const [fileContent, setFileContent] = useState('');

  // RAG Search Test state
  const [testQuery, setTestQuery] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    fetchItems();
  }, [currentSiteId]);

  const fetchItems = async () => {
    if (!currentSiteId) return;
    try {
      const res = await fetch(`/api/v1/knowledge?websiteId=${currentSiteId}`);
      const data = await res.json();
      if (data.items) setItems(data.items);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCrawl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crawlUrl || !currentSiteId) return;
    setLoading(true);

    try {
      await fetch('/api/v1/knowledge/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId: currentSiteId, url: crawlUrl }),
      });
      setCrawlUrl('');
      fetchItems();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle || !manualContent || !currentSiteId) return;
    setLoading(true);

    try {
      await fetch('/api/v1/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: currentSiteId,
          type: 'text',
          title: manualTitle,
          content: manualContent,
        }),
      });
      setManualTitle('');
      setManualContent('');
      fetchItems();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileTitle || !fileContent || !currentSiteId) return;
    setLoading(true);

    try {
      await fetch('/api/v1/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: currentSiteId,
          type: 'file',
          title: fileTitle,
          fileName: fileTitle,
          content: fileContent,
        }),
      });
      setFileTitle('');
      setFileContent('');
      fetchItems();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/v1/knowledge?id=${id}`, { method: 'DELETE' });
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const runRagTest = (query: string) => {
    setTestQuery(query);
    if (!query) {
      setTestResults([]);
      return;
    }
    const qLower = query.toLowerCase();
    const matches = items.map(item => {
      const matchScore = (item.title.toLowerCase().includes(qLower) ? 40 : 0) +
        (item.content.toLowerCase().includes(qLower) ? 50 : 10);
      return { item, similarity: matchScore };
    }).sort((a, b) => b.similarity - a.similarity);

    setTestResults(matches);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Knowledge Base & RAG Engine</h2>
          <p className="text-slate-400 text-xs">
            Manage documentation, crawl website URLs, and train your AI assistant with vector retrieval.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold">
            {items.length} Knowledge Sources Ingested
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('crawl')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'crawl'
              ? 'bg-brand-600 text-white shadow-glow'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Globe className="w-3.5 h-3.5" /> Web Crawler
        </button>
        <button
          onClick={() => setActiveTab('file')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'file'
              ? 'bg-brand-600 text-white shadow-glow'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Upload className="w-3.5 h-3.5" /> File Upload (PDF, DOCX, MD)
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'text'
              ? 'bg-brand-600 text-white shadow-glow'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Manual Text & Q&A
        </button>
        <button
          onClick={() => setActiveTab('rag-test')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'rag-test'
              ? 'bg-purple-600 text-white shadow-glow'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> RAG Vector Search Sandbox
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'crawl' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 max-w-3xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-400" /> Crawl Website Documentation
          </h3>
          <p className="text-slate-400 text-xs">
            Enter a public webpage URL. Acme will crawl headings, paragraph text, and index semantic chunks.
          </p>

          <form onSubmit={handleCrawl} className="flex gap-3">
            <input
              type="url"
              required
              value={crawlUrl}
              onChange={(e) => setCrawlUrl(e.target.value)}
              placeholder="https://acme.com/docs/getting-started"
              className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 font-semibold text-xs text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition shadow-glow flex items-center gap-2 shrink-0"
            >
              {loading ? 'Crawling...' : <><Plus className="w-4 h-4" /> Crawl & Index</>}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'file' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 max-w-3xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-brand-400" /> Ingest PDF, DOCX or Markdown Document
          </h3>

          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Document Title</label>
              <input
                type="text"
                required
                value={fileTitle}
                onChange={(e) => setFileTitle(e.target.value)}
                placeholder="Product_Specification_2026.pdf"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Document Text Content</label>
              <textarea
                rows={5}
                required
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                placeholder="Paste the raw text contents of your PDF, DOCX, or Markdown file..."
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 font-semibold text-xs text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition shadow-glow"
            >
              {loading ? 'Ingesting...' : 'Ingest Document File'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'text' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 max-w-3xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-400" /> Add Custom Text / FAQ Article
          </h3>

          <form onSubmit={handleAddManual} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Title</label>
              <input
                type="text"
                required
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="Refund Policy & Guarantee"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Content</label>
              <textarea
                rows={5}
                required
                value={manualContent}
                onChange={(e) => setManualContent(e.target.value)}
                placeholder="Describe your policy or answer detailed questions..."
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 font-semibold text-xs text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition shadow-glow"
            >
              {loading ? 'Saving...' : 'Save Knowledge Entry'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'rag-test' && (
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" /> Vector Retrieval Sandbox
          </h3>
          <p className="text-slate-400 text-xs">
            Test how incoming visitor questions fetch relevant context chunks from your Knowledge Base.
          </p>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={testQuery}
              onChange={(e) => runRagTest(e.target.value)}
              placeholder="Type a query like 'What is the cost of Pro plan?' or 'How to embed?'..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          {testResults.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="text-xs font-semibold text-purple-300">Matching Vector Sources:</div>
              {testResults.map(({ item, similarity }) => (
                <div key={item.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-white mb-1">{item.title}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-2">{item.content}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-semibold">
                      {similarity}% Match
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Knowledge Sources Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-400" /> Indexed Knowledge Articles
          </h3>
          <button onClick={fetchItems} className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/80">
          {items.map((item) => (
            <div key={item.id} className="p-5 flex items-center justify-between hover:bg-slate-900/40 transition">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400 shrink-0 mt-0.5">
                  {item.type === 'url' ? <Globe className="w-5 h-5" /> : item.type === 'file' ? <Upload className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1 max-w-2xl mb-2">{item.content}</p>
                  <div className="flex items-center gap-4 text-[11px] text-slate-500">
                    <span>{item.chunksCount} Vector Chunks</span>
                    <span>•</span>
                    <span>Synced {new Date(item.lastSyncedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                title="Delete Entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
