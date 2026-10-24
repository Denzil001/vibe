'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Plus, 
  Train, 
  Search, 
  CheckCircle2, 
  MessageSquare, 
  Shield, 
  X,
  Filter
} from 'lucide-react';
import { Group } from '@/types';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';

const CATEGORIES = [
  'All',
  'Tech & Innovation',
  'Language Exchange',
  'Study & Exam Prep',
  'Travel Tips & Food',
  'Casual Games & Trivia',
  'Book Club & Stories',
];

export default function GroupsPage() {
  const [groups, setGroups] = useState<(Group & { isMember?: boolean })[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // New Group Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupCat, setNewGroupCat] = useState<'Language Exchange' | 'Study & Exam Prep' | 'Book Club & Stories' | 'Tech & Innovation' | 'Travel Tips & Food' | 'Casual Games & Trivia'>('Tech & Innovation');
  const [newGroupTrain, setNewGroupTrain] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetch('/api/groups')
      .then(res => res.json())
      .then(data => setGroups(data.groups || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDesc,
          category: newGroupCat,
          trainNumber: newGroupTrain || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setGroups(prev => [data.group, ...prev]);
      setIsCreateModalOpen(false);
      setNewGroupName('');
      setNewGroupDesc('');
      setNewGroupTrain('');
    } catch (err: any) {
      alert(err.message || 'Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredGroups = groups.filter(g => {
    const matchesCat = selectedCategory === 'All' || g.category === selectedCategory;
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.trainNumber && g.trainNumber.includes(searchQuery));
    return matchesCat && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center items-center flex-1 bg-slate-50">
        <div className="animate-pulse text-sm text-slate-500 font-medium">Loading passenger communities...</div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50 flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-5 h-5 text-brand-600" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
                Train & Topic Communities
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              Join moderated passenger cohorts organized around specific train routes, skills, exams, or hobbies
            </p>
          </div>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            size="md"
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Create Community</span>
          </Button>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by train number, topic..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-navy-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Groups Grid */}
        {filteredGroups.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
            <Users className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-navy-900">No communities found</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              No existing groups matched your filter. Be the first to start a group for this route or subject!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map(group => (
              <div
                key={group.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-brand-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant="navy" size="sm">{group.category}</Badge>
                    {group.trainNumber && (
                      <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        Train {group.trainNumber}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-navy-900 mb-2 leading-snug">
                    {group.name}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {group.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    {group.memberCount} active member{group.memberCount === 1 ? '' : 's'}
                  </span>

                  <Link
                    href={`/groups/${group.id}`}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5 ${
                      group.isMember
                        ? 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200'
                        : 'bg-navy-900 text-white hover:bg-navy-800'
                    }`}
                  >
                    {group.isMember ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Entered</span>
                      </>
                    ) : (
                      <span>Join & Chat</span>
                    )}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Community Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-600" />
                  <h3 className="text-lg font-bold text-navy-900">Create a Passenger Community</h3>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Community Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    placeholder="e.g. Mumbai Rajdhani AI Builders & Researchers"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={newGroupCat}
                    onChange={e => setNewGroupCat(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Tech & Innovation">Tech & Innovation</option>
                    <option value="Language Exchange">Language Exchange</option>
                    <option value="Study & Exam Prep">Study & Exam Prep</option>
                    <option value="Travel Tips & Food">Travel Tips & Food</option>
                    <option value="Book Club & Stories">Book Club & Stories</option>
                    <option value="Casual Games & Trivia">Casual Games & Trivia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Associated Train Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={newGroupTrain}
                    onChange={e => setNewGroupTrain(e.target.value)}
                    placeholder="e.g. 12951 (Leave blank for general travel topic)"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Description & Purpose *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newGroupDesc}
                    onChange={e => setNewGroupDesc(e.target.value)}
                    placeholder="Describe what passengers will discuss, study, or share..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 border border-slate-200">
                  <span className="font-semibold block text-slate-700 mb-0.5">Automated Community Rules:</span>
                  All groups automatically inherit VIBE anti-harassment standards and prohibitions against sharing private seat/berth numbers.
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isCreating}
                    className="bg-brand-600 hover:bg-brand-700 font-bold"
                  >
                    Create Group
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
