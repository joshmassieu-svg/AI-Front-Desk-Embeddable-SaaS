'use client';

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Mail, Shield, Check, Copy, Trash2, Clock, Crown, RefreshCw } from 'lucide-react';
import { useWebsite } from '@/context/website-context';
import { useAuth } from '@/context/auth-context';
import { WorkplaceMember, WorkplaceInvitation, WorkplaceRole } from '@/lib/types';

export default function TeamPage() {
  const { workplace } = useWebsite();
  const { user } = useAuth();

  const [members, setMembers] = useState<WorkplaceMember[]>([]);
  const [invitations, setInvitations] = useState<WorkplaceInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkplaceRole>('member');
  const [inviting, setInviting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [latestInviteUrl, setLatestInviteUrl] = useState<string | null>(null);

  const workplaceId = workplace?.id;
  const workplaceName = workplace?.name || 'Workplace';

  const fetchData = async () => {
    if (!workplaceId) return;
    setLoading(true);

    try {
      const [membersRes, invRes] = await Promise.all([
        fetch(`/api/v1/workplace/members?workplaceId=${workplaceId}`),
        fetch(`/api/v1/workplace/invitations?workplaceId=${workplaceId}`),
      ]);

      const membersData = await membersRes.json();
      const invData = await invRes.json();

      if (membersData.members) setMembers(membersData.members);
      if (invData.invitations) setInvitations(invData.invitations);
    } catch (err) {
      console.error('Error fetching team data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [workplaceId]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !workplaceId) return;

    setInviting(true);
    setLatestInviteUrl(null);

    try {
      const res = await fetch('/api/v1/workplace/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workplaceId,
          workplaceName,
          email: inviteEmail.trim(),
          role: inviteRole,
          createdBy: user?.email || user?.uid || 'Owner',
        }),
      });

      const data = await res.json();

      if (data.invitation) {
        setInvitations((prev) => [data.invitation, ...prev]);
        const joinUrl = `${window.location.origin}/join?code=${data.invitation.inviteCode}`;
        setLatestInviteUrl(joinUrl);
        setInviteEmail('');
      }
    } catch (err) {
      console.error('Failed to create invitation:', err);
    } finally {
      setInviting(false);
    }
  };

  const handleCopyLink = (inviteCode: string) => {
    const joinUrl = `${window.location.origin}/join?code=${inviteCode}`;
    navigator.clipboard.writeText(joinUrl);
    setCopiedCode(inviteCode);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleRemoveMember = async (targetUserId: string) => {
    if (!workplaceId || !confirm('Are you sure you want to remove this team member?')) return;

    try {
      const res = await fetch('/api/v1/workplace/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workplaceId, targetUserId }),
      });

      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.userId !== targetUserId));
      }
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    if (!confirm('Are you sure you want to revoke this invitation?')) return;

    try {
      const res = await fetch('/api/v1/workplace/invitations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId }),
      });

      if (res.ok) {
        setInvitations((prev) => prev.filter((i) => i.id !== inviteId));
      }
    } catch (err) {
      console.error('Failed to revoke invitation:', err);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Users className="w-5 h-5 text-brand-600" /> Team & Workplace Members
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Invite teammates to <span className="text-brand-600 font-semibold">{workplaceName}</span>. Share chatbots, AI knowledge bases, and live support inboxes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              setLatestInviteUrl(null);
              setShowInviteModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" /> Invite Teammate
          </button>
        </div>
      </div>

      {/* Active Team Members List */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" /> Active Workplace Members ({members.length})
          </h3>
          <span className="text-[11px] text-slate-400">Collaborating in {workplaceName}</span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-brand-600" /> Loading team roster...
          </div>
        ) : members.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No active members found. Click &quot;Invite Teammate&quot; above to add members.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {members.map((member) => (
              <div key={member.userId || member.email} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs">
                    {member.email ? member.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                      <span>{member.email}</span>
                      {member.userId === user?.uid && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-500 rounded font-bold">You</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Joined {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'Recently'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Role Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      member.role === 'owner'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : member.role === 'admin'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-brand-50 text-brand-700 border border-brand-200'
                    }`}
                  >
                    {member.role === 'owner' && <Crown className="w-3 h-3 text-amber-500" />}
                    {member.role}
                  </span>

                  {/* Actions */}
                  {member.role !== 'owner' && member.userId !== user?.uid && (
                    <button
                      onClick={() => handleRemoveMember(member.userId)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                      title="Remove member from workplace"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Invitations */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" /> Pending Invitations ({invitations.length})
          </h3>
          <span className="text-[11px] text-slate-400">Invite links expire in 7 days</span>
        </div>

        {invitations.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No pending invitations. All invited members have accepted or expired.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {invitations.map((inv) => (
              <div key={inv.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">{inv.email}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Role: <strong className="text-slate-600 uppercase">{inv.role}</strong></span>
                      <span>•</span>
                      <span>Sent {new Date(inv.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyLink(inv.inviteCode)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg transition flex items-center gap-1.5 shadow-sm"
                  >
                    {copiedCode === inv.inviteCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-brand-600" />
                        <span>Copy Invite Link</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleRevokeInvite(inv.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                    title="Revoke invitation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Invite Teammate */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-brand-600" /> Invite Teammate to Workplace
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm"
              >
                ✕
              </button>
            </div>

            {latestInviteUrl ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
                  <div className="font-bold flex items-center gap-2 text-emerald-700">
                    <Check className="w-4 h-4" /> Invitation Generated Successfully!
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Share this unique link with your teammate to let them join <strong className="text-slate-900">{workplaceName}</strong>:
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono break-all text-slate-700 flex items-center justify-between gap-2">
                  <span className="truncate">{latestInviteUrl}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(latestInviteUrl);
                      setCopiedCode('latest');
                      setTimeout(() => setCopiedCode(null), 2500);
                    }}
                    className="shrink-0 p-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-[11px] font-sans font-semibold transition shadow-sm"
                  >
                    {copiedCode === 'latest' ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>

                <button
                  onClick={() => setShowInviteModal(false)}
                  className="w-full py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Teammate Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-600 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Workplace Role & Access
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as WorkplaceRole)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-600 cursor-pointer"
                  >
                    <option value="member">Member — Access chatbots, live inbox & leads</option>
                    <option value="admin">Admin — Manage settings, AI docs & invite team</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="flex-1 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition disabled:opacity-50"
                  >
                    {inviting ? 'Generating...' : 'Generate Invite Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
