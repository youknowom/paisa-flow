"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "motion/react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { toast } from "sonner";
import { Plus, Edit3, Trash2, User, X, Check } from "lucide-react";

interface MembersTabProps {
  tripId: Id<"trips">;
}

export function MembersTab({ tripId }: MembersTabProps) {
  const members = useQuery(api.tripMembers.getTripMembers, { tripId });
  const addMember = useMutation(api.tripMembers.addTripMember);
  const updateMember = useMutation(api.tripMembers.updateTripMember);
  const removeMember = useMutation(api.tripMembers.removeTripMember);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [editingId, setEditingId] = useState<Id<"tripMembers"> | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<Id<"tripMembers"> | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      await addMember({
        tripId,
        name: newName.trim(),
        email: newEmail.trim() || undefined,
      });
      toast.success(`${newName.trim()} added to the trip`);
      setNewName("");
      setNewEmail("");
      setShowAddForm(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add member");
    }
  };

  const handleUpdate = async (memberId: Id<"tripMembers">) => {
    if (!editName.trim()) return;
    try {
      await updateMember({ memberId, name: editName.trim() });
      toast.success("Member name updated");
      setEditingId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await removeMember({ memberId: deleteId });
      toast.success("Member removed from trip");
      setDeleteId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove member");
    } finally {
      setDeleting(false);
    }
  };

  if (!members) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-background font-semibold rounded-xl transition-colors text-sm"
        >
          <Plus size={16} />
          Add Member
        </motion.button>
      </div>

      {/* Add Member Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card border border-accent/20 rounded-2xl p-4 mb-4 overflow-hidden"
          >
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Member name"
                className="w-full bg-card-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors placeholder:text-text-muted/50"
                autoFocus
              />
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Email (optional)"
                className="w-full bg-card-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors placeholder:text-text-muted/50"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAdd}
                  disabled={!newName.trim()}
                  className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-background text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  Add
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Member List */}
      <div className="space-y-3">
        <AnimatePresence>
          {members.map((member, i) => (
            <motion.div
              key={member._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 group hover:border-border-hover transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-card-hover flex items-center justify-center border border-border">
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  <User size={16} className="text-text-muted" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                {editingId === member._id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 bg-card-hover border border-accent rounded-lg px-3 py-1 text-sm text-text-primary outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdate(member._id)}
                      className="p-1 text-accent"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 text-text-muted"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-text-primary">
                      {member.name}
                      {member.userId && (
                        <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-accent/10 text-accent">
                          account linked
                        </span>
                      )}
                    </p>
                    {member.email && (
                      <p className="text-xs text-text-muted">{member.email}</p>
                    )}
                  </>
                )}
              </div>

              {editingId !== member._id && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingId(member._id);
                      setEditName(member.name);
                    }}
                    className="p-1.5 rounded-lg hover:bg-card-hover text-text-muted hover:text-accent transition-colors"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteId(member._id)}
                    className="p-1.5 rounded-lg hover:bg-red/10 text-text-muted hover:text-red transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Remove Member"
        description="Members with paid expenses or splits cannot be removed."
        confirmLabel="Remove"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
