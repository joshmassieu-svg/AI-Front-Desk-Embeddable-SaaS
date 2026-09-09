'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Check, ArrowRight, Users, Globe, RefreshCw, Crown } from 'lucide-react';
import { useWebsite } from '@/context/website-context';
import { useAuth } from '@/context/auth-context';
import { Workplace } from '@/lib/firestore-service';

export default function WorkplacesPage() {
  const { workplace: activeWorkplace } = useWebsite();
  const { user } = useAuth();

  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [loading, setLoading] = useState(true);
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  const fetchWorkplaces = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/v1/workplace/user-workplaces?userId=${user.uid}&email=${encodeURIComponent(user.email || '')}`);
      const data = await res.json();
      if (data.workplaces) {
        setWorkplaces(data.workplaces);
      }
    } catch (err) {
      console.error('Failed to fetch user workplaces:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkplaces();
  }, [user]);

  const handleSwitchWorkplace = async (targetWorkplaceId: string) => {
    if (!user || targetWorkplaceId === activeWorkplace?.id) return;
    setSwitchingId(targetWorkplaceId);

    try {
      const res = await fetch('/api/v1/workplace/user-workplaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          workplaceId: targetWorkplaceId,
        }),
      });

      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to switch workplace:', err);
    } finally {
      setSwitchingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-brand-600" /> My Workplaces
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            View all workplaces accessible by your account (<span className="text-brand-600 font-mono font-semibold">{user?.email}</span>), switch active context, or create a new workspace.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchWorkplaces}
            className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm"
            title="Refresh workplaces"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Workplaces Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-brand-600" /> Fetching available workplaces...
        </div>
      ) : workplaces.length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl border border-slate-200 text-center space-y-4">
          <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
          <div className="text-sm font-semibold text-slate-800">No Workplaces Found</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don&apos;t belong to any active workplace yet. Create a workplace or accept an invitation code to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workplaces.map((wp) => {
            const isActive = wp.id === activeWorkplace?.id;
            const isOwner = wp.userId === user?.uid;
            const userMember = wp.members?.find((m) => m.userId === user?.uid || m.email.toLowerCase() === user?.email?.toLowerCase());
            const role = isOwner ? 'owner' : userMember?.role || 'member';
            const memberCount = wp.members?.length || 1;

            return (
              <div
                key={wp.id}
                className={`glass-panel p-6 rounded-2xl border flex flex-col justify-between space-y-5 transition relative overflow-hidden ${
                  isActive
                    ? 'border-brand-200 bg-brand-50/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                {isActive && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Check className="w-3 h-3" /> Active Workplace
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">{wp.name}</h3>
                      <div className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                        <Globe className="w-3 h-3 text-slate-400" /> {wp.domain}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {/* Role Badge */}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        role === 'owner'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-brand-50 text-brand-700 border border-brand-200'
                      }`}
                    >
                      {role === 'owner' && <Crown className="w-3 h-3 text-amber-500" />}
                      Role: {role}
                    </span>

                    {/* Subscription Plan Badge */}
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      Plan: {wp.plan ? wp.plan.toUpperCase() : 'FREE'}
                    </span>

                    {/* Trial Tag if active */}
                    {wp.trialEndsAt && (() => {
                      const diff = new Date(wp.trialEndsAt).getTime() - Date.now();
                      const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
                      if (days > 0) {
                        return (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Trial: {days}d left
                          </span>
                        );
                      }
                      return null;
                    })()}

                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" /> {memberCount} {memberCount === 1 ? 'Member' : 'Members'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono truncate max-w-[160px]">
                    ID: {wp.id}
                  </span>

                  {isActive ? (
                    <span className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Currently Selected
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSwitchWorkplace(wp.id)}
                      disabled={switchingId === wp.id}
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      {switchingId === wp.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-600" />
                          Switching...
                        </>
                      ) : (
                        <>
                          Switch Context
                          <ArrowRight className="w-3.5 h-3.5 text-brand-600" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
