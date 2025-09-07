"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/axios"
import { toast } from "sonner"
import { Plus, Trash2, Users, Mail, Crown, Building2, Loader2 } from "lucide-react"

interface TeamMember {
  employer_email: string
  name?: string
  company_name?: string
  invited_by?: string
  created_at: string
  status: string
}

interface TeamManagementProps {
  subscription: any
  isOwner: boolean
  onMemberUpdate?: () => void
}

export default function TeamManagement({ subscription, isOwner, onMemberUpdate }: TeamManagementProps) {
  const { user } = useAuthStore()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [addingMember, setAddingMember] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [memberStats, setMemberStats] = useState<{
    current_count: number
    max_members: number | null
    can_add_more: boolean
  }>({ current_count: 0, max_members: null, can_add_more: false })

  const planId = subscription?.plan_id || "free"
  const canManageTeam = isOwner && (planId === "premium" || planId === "enterprise")

  useEffect(() => {
    if (canManageTeam) {
      loadTeamMembers()
    }
  }, [canManageTeam])

  const loadTeamMembers = async () => {
    if (!user?.token) return
    
    setLoading(true)
    try {
      const response = await api.get("/subscription/members", {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      
      setMembers(response.data.members || [])
      setMemberStats({
        current_count: response.data.current_count || 0,
        max_members: response.data.max_members,
        can_add_more: response.data.can_add_more || false
      })
    } catch (error: any) {
      console.error("Failed to load team members:", error)
      if (error.response?.status !== 404) {
        toast.error("Failed to load team members")
      }
    } finally {
      setLoading(false)
    }
  }

  const addMember = async () => {
    if (!newMemberEmail.trim() || !user?.token) return
    
    setAddingMember(true)
    try {
      await api.post("/subscription/members/add", 
        { employer_email: newMemberEmail.trim() },
        { headers: { Authorization: `Bearer ${user.token}` } }
      )
      
      toast.success("Team member added successfully")
      setNewMemberEmail("")
      loadTeamMembers()
      onMemberUpdate?.()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to add team member")
    } finally {
      setAddingMember(false)
    }
  }

  const removeMember = async (email: string) => {
    if (!user?.token) return
    
    try {
      await api.post("/subscription/members/remove",
        { employer_email: email },
        { headers: { Authorization: `Bearer ${user.token}` } }
      )
      
      toast.success("Team member removed successfully")
      loadTeamMembers()
      onMemberUpdate?.()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to remove team member")
    }
  }

  if (!canManageTeam) {
    return null
  }

  return (
    <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Team Management</h3>
          <p className="text-sm text-muted-foreground">
            {planId === "premium" 
              ? "Add up to 4 additional team members" 
              : "Unlimited team members from your company"
            }
          </p>
        </div>
      </div>

      {/* Add Member Form */}
      {isOwner && memberStats.can_add_more && (
        <div className="mb-6 p-4 rounded-lg bg-muted/30">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="email"
                placeholder="Enter employer email address"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={addingMember}
              />
            </div>
            <button
              onClick={addMember}
              disabled={!newMemberEmail.trim() || addingMember}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {addingMember ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add Member
            </button>
          </div>
        </div>
      )}

      {/* Member Stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          {memberStats.current_count} / {memberStats.max_members || "∞"} members
        </div>
        {!memberStats.can_add_more && memberStats.max_members && (
          <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
            Member limit reached
          </div>
        )}
      </div>

      {/* Members List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : members.length > 0 ? (
        <div className="space-y-3">
          {members.map((member, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground">
                    {member.name || member.employer_email}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {member.employer_email}
                  </div>
                  {member.company_name && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {member.company_name}
                    </div>
                  )}
                </div>
              </div>
              
              {isOwner && (
                <button
                  onClick={() => removeMember(member.employer_email)}
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  title="Remove member"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No team members added yet</p>
          {isOwner && memberStats.can_add_more && (
            <p className="text-sm text-muted-foreground mt-1">
              Add team members to share subscription benefits
            </p>
          )}
        </div>
      )}

      {/* Enterprise Company Access Info */}
      {planId === "enterprise" && (
        <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <div className="flex items-start gap-3">
            <Crown className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground mb-1">Enterprise Access</h4>
              <p className="text-sm text-muted-foreground">
                All employees from your company automatically have access to posting jobs under this enterprise subscription.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
