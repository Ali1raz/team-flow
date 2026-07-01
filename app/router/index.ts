import { generateCompose, generateThreadSummary } from "./ai";
import {
  addMembersToChannel,
  createChannel,
  deleteChannel,
  getChannel,
  listChannelMembers,
  listChannels,
  removeMemberFromChannel,
  updateChannel,
} from "./channel";
import { getInvitionDEtails } from "./invitations";
import { inviteMember } from "./members";
import {
  createMessage,
  deleteMessage,
  listMessages,
  listThreads,
  updateMessage,
} from "./message";
import { getCurrentUser } from "./user";
import {
  cancelWorkspaceInvitation,
  createWorkspace,
  leaveWorkspace,
  listWorkspaceInvitations,
  listWorkspaceMembers,
  listWorkspaces,
  updateWorkspace,
  updateWorkspaceMemberRole,
} from "./workspace";

export const router = {
  user: {
    get: getCurrentUser,
  },
  workspace: {
    list: listWorkspaces,
    create: createWorkspace,
    update: updateWorkspace,
    leave: leaveWorkspace,
    members: {
      invite: inviteMember,
      list: listWorkspaceMembers,
      updateRole: updateWorkspaceMemberRole,
    },
    invitations: {
      list: listWorkspaceInvitations,
      cancel: cancelWorkspaceInvitation,
    },
  },
  channel: {
    create: createChannel,
    list: listChannels,
    get: getChannel,
    update: updateChannel,
    delete: deleteChannel,
    members: {
      list: listChannelMembers,
      add: addMembersToChannel,
      remove: removeMemberFromChannel,
    },
  },
  message: {
    create: createMessage,
    list: listMessages,
    update: updateMessage,
    delete: deleteMessage,
    threads: {
      list: listThreads,
    },
  },
  ai: {
    compose: {
      generate: generateCompose,
    },
    threads: {
      summary: {
        generate: generateThreadSummary,
      },
    },
  },
  invitation: {
    get: getInvitionDEtails,
  },
};
